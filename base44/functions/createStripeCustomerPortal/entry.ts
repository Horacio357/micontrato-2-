import { createClientFromRequest } from 'npm:@base44/sdk@0.8.43';
import Stripe from 'npm:stripe@14.21.0';
import { secrets } from 'base44:runtime';
import { resolveCustomer, readSubscription } from '../../shared/stripeSubscription.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { returnUrl = 'https://micontrato3.base44.app/mi-cuenta', action = 'manage' } = await req.json();
    if (!['manage', 'cancel'].includes(action)) return Response.json({ error: 'Acción no válida.' }, { status: 400 });
    const destination = new URL(returnUrl);
    const allowedOrigins = [req.headers.get('origin'), 'https://micontrato3.base44.app'];
    if (destination.protocol !== 'https:' || !allowedOrigins.includes(destination.origin) || destination.pathname !== '/mi-cuenta') {
      return Response.json({ error: 'La dirección de regreso no es válida.' }, { status: 400 });
    }
    const stripe = new Stripe(secrets.get('STRIPE_SECRET_KEY'));
    const customer = await resolveCustomer(stripe, user);
    if (!customer) return Response.json({ error: 'No encontramos una cuenta de facturación de Stripe para tu correo.' }, { status: 400 });
    const configs = await stripe.billingPortal.configurations.list({ active: true, limit: 100 });
    const config = configs.data.find((item) => item.is_default);
    if (!config?.features?.subscription_cancel?.enabled || config.features.subscription_cancel.mode !== 'at_period_end') {
      return Response.json({ error: 'El portal debe permitir cancelaciones al finalizar el período. Contactá al administrador.' }, { status: 409 });
    }
    let flowData;
    if (action === 'cancel') {
      const sub = await readSubscription(stripe, customer.id);
      if (!sub || ['canceled', 'incomplete_expired'].includes(sub.status)) {
        return Response.json({ error: 'No hay una suscripción vigente para dar de baja.' }, { status: 409 });
      }
      if (sub.cancel_at_period_end || sub.cancel_at) {
        return Response.json({ error: 'La baja ya está programada. Actualizá el estado para ver la fecha de finalización.' }, { status: 409 });
      }
      flowData = { type: 'subscription_cancel', subscription_cancel: { subscription: sub.id }, after_completion: { type: 'redirect', redirect: { return_url: `${destination.origin}/mi-cuenta` } } };
    }
    const session = await stripe.billingPortal.sessions.create({
      ...(flowData ? { flow_data: flowData } : {}),
      customer: customer.id,
      configuration: config.id,
      return_url: `${destination.origin}/mi-cuenta`,
      locale: 'es',
    });

    return Response.json({ url: session.url });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}