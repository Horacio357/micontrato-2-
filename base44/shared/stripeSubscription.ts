export async function resolveCustomer(stripe, user) {
  if (user.stripe_customer_id) {
    const customer = await stripe.customers.retrieve(user.stripe_customer_id);
    if (!customer.deleted && customer.email?.toLowerCase() === user.email?.toLowerCase()) return customer;
  }
  const customers = await stripe.customers.list({ email: user.email, limit: 2 });
  if (customers.data.length > 1) throw new Error('Hay más de un cliente de facturación asociado a tu correo. Contactá al administrador.');
  return customers.data[0] || null;
}

export async function readSubscription(stripe, customerId) {
  const subscriptions = [];
  for await (const sub of stripe.subscriptions.list({ customer: customerId, status: 'all', limit: 100 })) subscriptions.push(sub);
  const priority = { active: 0, trialing: 1, past_due: 2, unpaid: 3, paused: 4, incomplete: 5, canceled: 6, incomplete_expired: 7 };
  subscriptions.sort((a, b) => (priority[a.status] ?? 8) - (priority[b.status] ?? 8) || b.created - a.created);
  return subscriptions[0] || null;
}

export function subscriptionSnapshot(sub, customerId) {
  const hasSubscription = ['active', 'trialing'].includes(sub?.status);
  const end = sub?.current_period_end || sub?.items?.data?.[0]?.current_period_end;
  const expiresAt = end ? new Date(end * 1000).toISOString() : null;
  const canceledAt = sub?.ended_at ? new Date(sub.ended_at * 1000).toISOString() : null;
  const cancelAt = sub?.cancel_at ? new Date(sub.cancel_at * 1000).toISOString() : (sub?.cancel_at_period_end ? expiresAt : null);
  const status = sub?.status || 'none';
  return {
    fields: {
      subscription_status: hasSubscription ? 'active' : (['past_due', 'unpaid'].includes(status) ? 'past_due' : (status === 'canceled' ? 'canceled' : 'none')),
      stripe_customer_id: customerId || null,
      stripe_subscription_id: sub?.id || null,
      subscription_expires_at: expiresAt,
    },
    view: {
      subscription_status: status, has_subscription: hasSubscription,
      has_customer: Boolean(customerId), expires_at: expiresAt,
      cancel_at_period_end: Boolean(sub?.cancel_at_period_end), cancel_at: cancelAt,
      canceled_at: canceledAt,
    },
  };
}