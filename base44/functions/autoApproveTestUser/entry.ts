import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Pagos con Stripe DESACTIVADOS: todos los contratos son gratis.
// Esta función se dispara al crear un contrato y lo marca como "pagado"
// automáticamente para que quede disponible para descarga sin cobro.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { event, data } = body;

    if (!data || !event) {
      return Response.json({ skipped: true, reason: "no data or event" });
    }

    // Solo procesar contratos recién creados que estén pendientes de pago.
    if (event.type !== "create" || data.status !== "pending_payment") {
      return Response.json({ skipped: true, reason: "not a new pending_payment contract" });
    }

    // Aprobar todos los contratos: marcar como pagado (gratis).
    await base44.asServiceRole.entities.GeneratedContract.update(event.entity_id, {
      status: "paid",
      payment_method: "single",
    });

    return Response.json({ success: true, message: "Contract auto-approved (free mode)" });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});