import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const { contractId } = await req.json();

    if (!contractId) {
      return Response.json({ error: 'Falta contractId' }, { status: 400 });
    }

    // El acceso al documento respeta los permisos del usuario autenticado.
    const contracts = await base44.entities.GeneratedContract.filter({ id: contractId });
    const contract = contracts[0];
    if (!contract) {
      return Response.json({ error: 'Contrato no encontrado' }, { status: 404 });
    }

    const recipientEmail = user.email;
    const recipientName = user.full_name || 'usuario';

    if (!recipientEmail) {
      return Response.json({ error: 'No se encontró email del destinatario' }, { status: 400 });
    }

    // Fetch the contract text from the uploaded file URL
    let contractText = '';
    if (contract.generated_text?.startsWith('http')) {
      const res = await fetch(contract.generated_text);
      contractText = await res.text();
    } else {
      contractText = contract.generated_text || '';
    }

    const contractName = contract.template_name || 'Contrato';
    const createdDate = new Date(contract.created_date).toLocaleDateString('es-AR', {
      day: '2-digit', month: 'long', year: 'numeric'
    });

    const body = `
<div style="font-family: Arial, sans-serif; max-width: 680px; margin: 0 auto; color: #1a2332;">
  <div style="background: #1a2332; padding: 32px 40px; text-align: center;">
    <h1 style="color: #ffffff; font-size: 24px; margin: 0; font-family: Georgia, serif;">micontratos.com</h1>
  </div>

  <div style="padding: 40px;">
    <p style="font-size: 16px; margin-bottom: 8px;">Hola <strong>${recipientName}</strong>,</p>
    <p style="color: #4a5568; margin-bottom: 24px;">Tu contrato <strong>${contractName}</strong> fue generado exitosamente.</p>

    <div style="background: #f7f8fa; border-left: 4px solid #0088cc; padding: 16px 20px; border-radius: 4px; margin-bottom: 32px;">
      <p style="margin: 0 0 4px; font-size: 13px; color: #718096;">Fecha de generación</p>
      <p style="margin: 0; font-weight: 600;">${createdDate}</p>
    </div>

    <div style="text-align: center; margin-bottom: 40px;">
      <a href="https://app.micontrato.com.ar/mi-cuenta/contrato/${contractId}"
         style="background: #0088cc; color: #ffffff; padding: 14px 32px; border-radius: 4px; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block;">
        Ver y descargar mi contrato
      </a>
    </div>

    <hr style="border: none; border-top: 1px solid #e2e8f0; margin-bottom: 32px;">

    <p style="font-size: 13px; color: #718096; margin-bottom: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Texto del contrato generado:</p>
    <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 32px; font-family: Georgia, serif; font-size: 13px; line-height: 1.8; color: #2d3748; white-space: pre-wrap;">
${contractText}
    </div>
  </div>

  <div style="background: #f7f8fa; padding: 20px 40px; text-align: center;">
    <p style="font-size: 12px; color: #a0aec0; margin: 0;">© ${new Date().getFullYear()} micontratos.com · Generado bajo legislación argentina</p>
  </div>
</div>
    `.trim();

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: recipientEmail,
      subject: `Tu contrato "${contractName}" está listo — micontratos.com`,
      body,
    });

    return Response.json({ ok: true, sent_to: recipientEmail });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}