import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get IP from headers (supports proxies/CDNs)
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      req.headers.get("cf-connecting-ip") ||
      "IP no disponible";

    const userAgent = req.headers.get("user-agent") || "Desconocido";

    // Try to get geolocation from IP using a free API
    let geolocation = "No disponible";
    try {
      if (ip && ip !== "IP no disponible") {
        const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=city,country,regionName&lang=es`);
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData.city) {
            geolocation = `${geoData.city}, ${geoData.regionName}, ${geoData.country}`;
          }
        }
      }
    } catch (_) {
      // Geolocation is optional, don't fail
    }

    const signedAt = new Date().toISOString();

    return Response.json({
      ip,
      userAgent,
      geolocation,
      signedAt,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});