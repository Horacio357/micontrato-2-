import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import Stripe from 'npm:stripe@14.21.0';
import { secrets } from 'base44:runtime';
import { resolveCustomer, readSubscription, subscriptionSnapshot } from '../../shared/stripeSubscription.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const stripe = new Stripe(secrets.get('STRIPE_SECRET_KEY'));
    const customer = await resolveCustomer(stripe, user);
    const sub = customer ? await readSubscription(stripe, customer.id) : null;
    const snapshot = subscriptionSnapshot(sub, customer?.id);
    await base44.asServiceRole.entities.User.update(user.id, snapshot.fields);
    return Response.json(snapshot.view);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}