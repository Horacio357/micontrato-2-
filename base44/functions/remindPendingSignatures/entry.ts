import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Esta función solo puede ejecutarse como tarea del sistema (sin usuario)
    // Usamos service role para acceder a todos los contratos
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Traer contratos en estado pending_signature con más de 7 días sin cambios
    const contracts = await base44.asServiceRole.entities.GeneratedContract.filter({
      status: "pending_signature",
    });

    const staleContracts = contracts.filter((c) => {
      const updatedAt = new Date(c.updated_date || c.created_date);
      return updatedAt < oneWeekAgo;
    });

    if (staleContracts.length === 0) {
      return Response.json({ ok: true, reminded: 0, message: "No hay contratos pendientes de firma con más de 7 días." });
    }

    // Obtener todos los usuarios para mapear email por created_by
    const users = await base44.asServiceRole.entities.User.list();
    const userMap = {};
    for (const u of users) {
      userMap[u.email] = u;
    }

    let reminded = 0;
    const errors = [];

    for (const contract of staleContracts) {
      const ownerEmail = contract.created_by;
      if (!ownerEmail) continue;

      const owner = userMap[ownerEmail];
      const userName = owner?.full_name || ownerEmail;
      const contractName = contract.template_name || "Contrato";
      const contractId = contract.id;

      const daysPending = Math.floor(
        (Date.now() - new Date(contract.updated_date || contract.created_date).getTime()) / (1000 * 60 * 60 * 24)
      );

      const body = `
Hola ${userName},

Te recordamos que tu contrato <strong>${contractName}</strong> tiene firmas pendientes hace <strong>${daysPending} días</strong>.

Para que el documento tenga validez legal, todas las partes deben completar la firma digital.

<a href="https://app.micontrato.com.ar/mi-cuenta/contrato/${contractId}" style="display:inline-block;margin-top:12px;padding:10px 20px;background:#0073d4;color:#fff;text-decoration:none;border-radius:4px;">Ver y completar firmas</a>

Si ya no necesitás este contrato, podés ignorar este mensaje.

— El equipo de micontrato
      `.trim();

      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: ownerEmail,
          subject: `Recordatorio: tu contrato "${contractName}" tiene firmas pendientes`,
          body,
        });
        reminded++;
      } catch (e) {
        errors.push({ contractId, error: e.message });
      }
    }

    return Response.json({ ok: true, reminded, errors });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});