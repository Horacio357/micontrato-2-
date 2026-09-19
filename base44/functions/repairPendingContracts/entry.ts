import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Safety net: marks as paid any pending_payment contracts that fall within the
 * active subscription window of a subscriber. Handles the "anonymous" case where
 * a contract was created before the user logged in: if there is exactly ONE active
 * subscriber, unowned pending contracts within their subscription window are
 * associated to them and marked covered by the subscription.
 *
 * Designed to run on a schedule (e.g. hourly) and also be invokable manually.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Gather active, non-expired subscribers.
    const now = new Date();
    const activeSubs = (await base44.asServiceRole.entities.User.filter({ subscription_status: "active" }))
      .filter((u) => !u.subscription_expires_at || new Date(u.subscription_expires_at) > now);

    if (activeSubs.length === 0) {
      return Response.json({ success: true, repaired: 0, reason: "no active subscribers" });
    }

    // Pending contracts to evaluate.
    const pending = await base44.asServiceRole.entities.GeneratedContract.filter(
      { status: "pending_payment" }, "-created_date", 500
    );

    // Subscription window for a monthly plan: [expires - 1 month, expires].
    const windowFor = (user) => {
      const to = new Date(user.subscription_expires_at);
      const from = new Date(to);
      from.setMonth(from.getMonth() - 1);
      return { from, to };
    };

    const soleSubscriber = activeSubs.length === 1 ? activeSubs[0] : null;
    let repaired = 0;

    for (const c of pending) {
      const created = new Date(c.created_date);

      // 1) Contract already owned by a known subscriber.
      let owner = activeSubs.find((u) => u.id === c.created_by_id);

      // 2) Unowned (anonymous) contract + exactly one subscriber → attribute to them.
      if (!owner && (!c.created_by_id || c.created_by_id === "anonymous") && soleSubscriber) {
        owner = soleSubscriber;
      }

      if (!owner) continue;

      const { from, to } = windowFor(owner);
      if (created < from || created > to) continue;

      const payload = { status: "paid", payment_method: "subscription" };
      if (!c.created_by_id || c.created_by_id === "anonymous") payload.created_by_id = owner.id;
      await base44.asServiceRole.entities.GeneratedContract.update(c.id, payload);
      repaired++;
    }

    return Response.json({ success: true, repaired });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});