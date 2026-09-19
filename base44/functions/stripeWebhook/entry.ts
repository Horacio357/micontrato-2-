import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@14.21.0';
import { secrets } from 'base44:runtime';
import { readSubscription, subscriptionSnapshot } from '../../shared/stripeSubscription.ts';

// Webhook de Stripe: mantiene el estado de suscripción del usuario sincronizado
// en tiempo real. Stripe llama a este endpoint apenas se acredita un pago,
// se renueva o se cancela una suscripción — así el usuario nunca queda bloqueado.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const stripe = new Stripe(secrets.get('STRIPE_SECRET_KEY'));
    const webhookSecret = secrets.get('STRIPE_WEBHOOK_SECRET');

    const signature = req.headers.get("stripe-signature");
    const body = await req.text();

    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      return Response.json({ error: `Webhook signature verification failed: ${err.message}` }, { status: 400 });
    }

    // La firma de Stripe autoriza las operaciones del webhook sin sesión de usuario.

    // Resuelve el email del cliente a partir del customer de Stripe.
    const resolveEmail = async (customerId) => {
      if (!customerId) return null;
      try {
        const customer = await stripe.customers.retrieve(customerId);
        return customer?.email?.toLowerCase() || null;
      } catch (_) {
        return null;
      }
    };

    // Aplica un estado de suscripción al usuario cuyo email coincide.
    const applyToUser = async (email, fields) => {
      if (!email) return;
      const users = await base44.asServiceRole.entities.User.filter({ email });
      const matched = users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
      if (!matched) return;
      await base44.asServiceRole.entities.User.update(matched.id, fields);
    };

    const syncCustomer = async (customerId) => {
      if (!customerId) return;
      const sub = await readSubscription(stripe, customerId);
      const snapshot = subscriptionSnapshot(sub, customerId);
      const users = await base44.asServiceRole.entities.User.filter({ stripe_customer_id: customerId });
      if (users.length === 1) {
        await base44.asServiceRole.entities.User.update(users[0].id, snapshot.fields);
      } else {
        await applyToUser(await resolveEmail(customerId), snapshot.fields);
      }
    };

    // Marca un contrato como pagado a partir de su contract_id (pago único).
    const markContractPaid = async (contractId, ownerEmail) => {
      if (!contractId) return;
      try {
        const fields = { status: "paid", payment_method: "single" };
        if (ownerEmail) {
          const users = await base44.asServiceRole.entities.User.filter({ email: ownerEmail });
          const owner = users?.find((u) => u.email?.toLowerCase() === ownerEmail.toLowerCase());
          if (owner) fields.created_by_id = owner.id;
        }
        await base44.asServiceRole.entities.GeneratedContract.update(contractId, fields);
      } catch (_) { /* ignore */ }
    };

    switch (event.type) {
      // Checkout completado → confirma pago único o activa la suscripción al instante.
      case "checkout.session.completed": {
        const session = event.data.object;
        const email = (session.customer_email || session.customer_details?.email || (await resolveEmail(session.customer)))?.toLowerCase() || null;

        if (session.mode === "subscription") {
          await syncCustomer(session.customer);
        } else {
          // Pago único de un contrato → lo marca como pagado.
          await markContractPaid(session.metadata?.contract_id, email);
        }
        break;
      }

      // Consulta el estado actual, incluso si los eventos llegan fuera de orden.
      case 'invoice.payment_succeeded':
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        if (invoice.subscription || invoice.parent?.subscription_details?.subscription) await syncCustomer(invoice.customer);
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        await syncCustomer(event.data.object.customer);
        break;
      }

      default:
        // Otros eventos no nos interesan.
        break;
    }

    return Response.json({ received: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}