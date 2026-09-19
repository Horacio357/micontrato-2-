import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@14.21.0';
import { secrets } from 'base44:runtime';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { sessionId, contractId } = await req.json();

    if (!sessionId || !contractId) return Response.json({ error: 'Faltan datos del pago.' }, { status: 400 });
    const [contract] = await base44.entities.GeneratedContract.filter({ id: contractId });
    if (!contract) return Response.json({ error: 'Contrato no encontrado.' }, { status: 404 });
    const stripe = new Stripe(secrets.get('STRIPE_SECRET_KEY'));
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.metadata?.contract_id !== contractId) return Response.json({ error: 'El pago no corresponde a este contrato.' }, { status: 403 });
    const isPaid = session.payment_status === 'paid';

    if (isPaid) {
      await base44.asServiceRole.entities.GeneratedContract.update(contractId, {
        status: 'paid',
        payment_method: session.metadata?.method || 'single',
      });
      return Response.json({ success: true });
    }

    return Response.json({ success: false, payment_status: session.payment_status });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}