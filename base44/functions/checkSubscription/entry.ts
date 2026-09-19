import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    let user;
    try {
      user = await base44.auth.me();
    } catch (_) {
      return Response.json({ subscribed: false, reason: "not_authenticated" });
    }

    if (!user) {
      return Response.json({ subscribed: false, reason: "no_user" });
    }

    // Check subscription status on the user record
    if (user.subscription_status === "active") {
      const expiresAt = user.subscription_expires_at ? new Date(user.subscription_expires_at) : null;
      if (!expiresAt || expiresAt > new Date()) {
        return Response.json({ 
          subscribed: true, 
          plan: "unlimited",
          expires_at: user.subscription_expires_at || null
        });
      }
    }

    // Check if test user
    const TEST_EMAILS = ["contrato@pruebas.com", "fsmr02@gmail.com", "horacitoxp@gmail.com", "tomimarteau@gmail.com"];
    if (TEST_EMAILS.includes(user.email?.toLowerCase())) {
      return Response.json({ subscribed: true, plan: "test" });
    }

    return Response.json({ subscribed: false, reason: "no_active_subscription" });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});