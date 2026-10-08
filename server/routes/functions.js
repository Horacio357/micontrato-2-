import { Router } from 'express';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs/promises';
import { AlignmentType, Document, Footer, PageNumber, Packer, Paragraph, TextRun } from 'docx';
import { prisma } from '../db.js';
import { buildStrictContract } from '../services/contractGenerator.js';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const router = Router();

// Pagos simulados (QA): sólo fuera de producción, o si se habilitan explícitamente
const QA_PAYMENTS_ENABLED =
  process.env.NODE_ENV !== 'production' || process.env.ENABLE_QA_PAYMENTS === 'true';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

const isAdmin = (user) => user?.role === 'admin';
const isGuestOwner = (createdById) =>
  !createdById || createdById === 'guest' || String(createdById).startsWith('guest_');
const isBrowserOnlyId = (id) => typeof id === 'string' && id.startsWith('local_');

function canAccessContract(user, contract) {
  if (!contract) return false;
  if (isAdmin(user)) return true;
  if (isGuestOwner(contract.created_by_id)) return true;
  return !!user && contract.created_by_id === user.id;
}

function isOwnerOrAdmin(user, contract) {
  if (!user || !contract) return false;
  return isAdmin(user) || contract.created_by_id === user.id;
}

const hasActiveSubscription = (user) => ['active', 'trialing'].includes(user?.subscription_status);
const isContractPaid = (contract) => ['paid', 'downloaded', 'signed'].includes(contract?.status);

// Lee un archivo de /uploads a partir de una URL o ruta, sin permitir salir de la carpeta
async function readUploadedFile(source) {
  const idx = source.indexOf('/uploads/');
  if (idx === -1) return null;
  const fileName = path.basename(source.slice(idx + '/uploads/'.length).split(/[?#]/)[0]);
  if (!fileName) return null;
  const filePath = path.join(UPLOADS_DIR, fileName);
  if (!filePath.startsWith(UPLOADS_DIR + path.sep)) return null;
  return fs.readFile(filePath, 'utf-8');
}

// 1. generateContractAI
router.post('/generateContractAI', async (req, res) => {
  try {
    const { contractSlug, province, formData, preview = false } = req.body;
    if (!contractSlug || !province || !formData) {
      return res.status(400).json({ error: "Faltan datos requeridos: contractSlug, province, formData" });
    }

    const contract = await buildStrictContract(contractSlug, formData);
    if (!contract) {
      return res.status(404).json({ error: `No se encontró una plantilla estricta para "${contractSlug}".` });
    }

    return res.json({
      generated_text: contract.generated_text,
      document_blocks: contract.document_blocks,
      missing_fields: contract.missing_fields,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// 2. exportContractDocx
router.post('/exportContractDocx', async (req, res) => {
  try {
    const user = req.user;
    const { contractId, generatedText, templateName } = req.body || {};
    if (!contractId && !generatedText) return res.status(400).json({ error: 'Falta contractId o generatedText' });
    if (!user) return res.status(401).json({ error: 'Iniciá sesión para descargar el contrato' });

    let source = '';
    let sourceIsTrusted = false;
    let docTemplateName = templateName || 'contrato';
    let contract = null;

    if (contractId && !isBrowserOnlyId(contractId)) {
      try {
        contract = await prisma.generatedContract.findUnique({ where: { id: contractId } });
      } catch (dbErr) {
        console.warn('DB lookup failed in exportContractDocx:', dbErr);
      }
    }

    if (contract) {
      if (!canAccessContract(user, contract)) {
        return res.status(403).json({ error: 'No tenés acceso a este contrato' });
      }
      if (!isAdmin(user) && !isContractPaid(contract) && !hasActiveSubscription(user)) {
        return res.status(402).json({ error: 'Este contrato requiere pago o una membresía activa para descargarse' });
      }
      source = contract.generated_text || '';
      sourceIsTrusted = true;
      if (contract.template_name) docTemplateName = contract.template_name;
    } else {
      // Contrato guardado sólo en el navegador: no hay registro de pago posible
      if (!isAdmin(user) && !hasActiveSubscription(user)) {
        return res.status(402).json({ error: 'Se requiere una membresía activa para descargar este contrato' });
      }
      source = typeof generatedText === 'string' ? generatedText : '';
    }

    // Step A: si el contenido es un archivo subido o una URL, leerlo de forma segura
    if (typeof source === 'string' && (source.startsWith('http://') || source.startsWith('https://') || source.startsWith('/uploads/'))) {
      try {
        const local = await readUploadedFile(source).catch(() => null);
        if (local !== null) {
          source = local;
        } else if (sourceIsTrusted && /^https?:\/\//.test(source)) {
          // Sólo se descargan URLs externas guardadas en la base, nunca las enviadas por el cliente
          const fetchRes = await fetch(source);
          if (fetchRes.ok) source = await fetchRes.text();
        } else {
          source = '';
        }
      } catch (fetchErr) {
        console.warn('Failed to read contract source in exportContractDocx:', fetchErr);
        source = '';
      }
    }

    // Step B: Extract actual text content from source (which might be JSON string)
    let text = source;
    try {
      const parsed = JSON.parse(source);
      if (typeof parsed === 'object' && parsed !== null) {
        if (typeof parsed.text === 'string' && parsed.text.trim()) {
          text = parsed.text;
        } else if (Array.isArray(parsed.blocks) && parsed.blocks.length > 0) {
          text = parsed.blocks.map((block) => block.content).filter(Boolean).join('\n\n');
        }
      }
    } catch {
      // Plain text, keep as is
    }

    if (!text.trim()) return res.status(409).json({ error: 'El contrato todavía no tiene contenido' });
    text = text.replace(/^\[CENTRAR\]/, '');

    const lines = text.split(/\r?\n/);
    const firstLine = lines[0].trim();
    const hasTitle = firstLine.length < 100 && firstLine === firstLine.toUpperCase() && /[A-ZÁÉÍÓÚÑ]/.test(firstLine);

    const runsFor = (lineText, bold = false) =>
      String(lineText).split('\n').map((line, index) => new TextRun({ text: line, bold, size: bold ? 24 : 22, font: 'Times New Roman', break: index ? 1 : 0 }));

    const paragraphs = lines.map((line, index) => new Paragraph({
      children: runsFor(line, index === 0 && hasTitle),
      alignment: index === 0 && hasTitle ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
      spacing: { line: 360, after: 0 },
      keepNext: index === 0 && hasTitle,
      widowControl: true,
    }));

    const doc = new Document({
      sections: [{
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1985, right: 1418, bottom: 1701, left: 1701 },
          },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'Página ', font: 'Times New Roman', size: 18 }),
                  new TextRun({ children: [PageNumber.CURRENT], font: 'Times New Roman', size: 18 }),
                ],
              }),
            ],
          }),
        },
        children: paragraphs,
      }],
    });

    const base64 = await Packer.toBase64String(doc);
    const safeName = (docTemplateName || 'contrato').replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ _-]/g, '').trim() || 'contrato';
    return res.json({ base64, filename: `${safeName}.docx` });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// 3. createContractSignature
router.post('/createContractSignature', async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const {
      contract_id,
      party_role,
      signer_name,
      signer_email,
      signer_dni,
      signature_image,
      terms_accepted,
      declaration_accepted,
      signing_token,
    } = req.body;

    if (!contract_id || !signer_name || !party_role || !signature_image) {
      return res.status(400).json({ error: 'Faltan datos requeridos: contract_id, signer_name, party_role, signature_image' });
    }
    if (!['part_a', 'part_b'].includes(party_role)) {
      return res.status(400).json({ error: 'party_role inválido' });
    }
    if (isBrowserOnlyId(contract_id)) {
      return res.status(409).json({ error: 'Este contrato no está guardado en tu cuenta. Volvé a generarlo con la sesión iniciada para poder firmarlo.' });
    }

    const signedAt = new Date().toISOString();
    const payload = [
      signer_name || '',
      signer_email || '',
      signer_dni || '',
      party_role || '',
      signedAt,
    ].join('|');

    const signatureHash = crypto.createHash('sha256').update(payload).digest('hex').toUpperCase();
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Desconocido';

    const contract = await prisma.generatedContract.findUnique({ where: { id: contract_id } });
    if (!contract) return res.status(404).json({ error: 'Contrato no encontrado' });
    if (!isOwnerOrAdmin(user, contract)) {
      return res.status(403).json({ error: 'No tenés acceso a este contrato' });
    }
    if (!isAdmin(user) && !isContractPaid(contract) && !hasActiveSubscription(user)) {
      return res.status(402).json({ error: 'Este contrato requiere pago o una membresía activa para firmarse' });
    }
    const sigFieldKey = party_role === 'part_a' ? 'signature_part_a' : 'signature_part_b';
    if (contract[sigFieldKey]?.signed_at) {
      return res.status(409).json({ error: 'Esta parte ya firmó el contrato' });
    }

    const signature = await prisma.contractSignature.create({
      data: {
        contract_id,
        signer_name: signer_name.trim(),
        signer_email: signer_email?.trim() || user.email,
        signer_dni: signer_dni?.trim() || '',
        party_role,
        signature_image,
        signed_at: new Date(signedAt),
        ip_address: ip,
        user_agent: userAgent,
        geolocation: 'No disponible',
        signature_hash: signatureHash,
        terms_accepted: !!terms_accepted,
        declaration_accepted: !!declaration_accepted,
      },
    });

    const sigData = {
      signer_name: signer_name.trim(),
      signer_email: signer_email?.trim() || user.email,
      signer_dni: signer_dni?.trim() || '',
      signed_at: signedAt,
      ip_address: ip,
      signature_hash: signatureHash,
    };

    const hasA = party_role === 'part_a' || Boolean(contract.signature_part_a?.signed_at);
    const hasB = party_role === 'part_b' || Boolean(contract.signature_part_b?.signed_at);
    const newSigStatus = hasA && hasB ? 'fully_signed' : 'partially_signed';

    await prisma.generatedContract.update({
      where: { id: contract_id },
      data: {
        [sigFieldKey]: sigData,
        signature_status: newSigStatus,
        status: newSigStatus === 'fully_signed' ? 'signed' : contract.status,
      },
    });

    return res.json({ ok: true, signature_id: signature.id, signature_hash: signatureHash, signed_at: signedAt });
  } catch (error) {
    console.error('Error in createContractSignature:', error);
    return res.status(500).json({ error: 'No se pudo registrar la firma. Intentá nuevamente.' });
  }
});

// 4. sendContractEmail
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[c]));

router.post('/sendContractEmail', async (req, res) => {
  try {
    const user = req.user;
    const { contractId } = req.body || {};
    if (!contractId) return res.status(400).json({ error: 'Falta contractId' });
    // Invitados: no hay casilla a la cual enviar; se omite sin error
    if (!user) return res.json({ ok: true, skipped: true, sent_to: [] });

    let contractTitle = 'Contrato generado';
    if (!isBrowserOnlyId(contractId)) {
      const contract = await prisma.generatedContract.findUnique({ where: { id: contractId } });
      if (!contract) return res.status(404).json({ error: 'Contrato no encontrado' });
      if (!isOwnerOrAdmin(user, contract)) return res.status(403).json({ error: 'No tenés acceso a este contrato' });
      if (contract.template_name) contractTitle = contract.template_name;
    }

    const recipientEmail = user.email;
    const frontendUrl = process.env.FRONTEND_URL || 'https://micontrato.com.ar';

    if (resend) {
      await resend.emails.send({
        from: 'MiContrato <hola@micontrato.com.ar>',
        to: [recipientEmail],
        subject: `Tu contrato: ${contractTitle}`,
        html: `
          <h1>¡Hola!</h1>
          <p>Tu contrato <strong>${escapeHtml(contractTitle)}</strong> se ha generado exitosamente y está listo para descargar o firmar.</p>
          <p><a href="${frontendUrl}/mi-cuenta/contrato/${encodeURIComponent(contractId)}">Ver contrato</a></p>
          <p>Gracias por usar MiContrato.</p>
        `,
      });
    } else {
      console.log(`[Mock Email] To: ${recipientEmail}, Subject: Tu contrato: ${contractTitle}`);
    }

    return res.json({ ok: true, sent_to: [recipientEmail] });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Marca un contrato como pagado validando sesión y propiedad
async function markContractPaid(user, contractId, paymentMethod) {
  if (!user) return { status: 401, error: 'Iniciá sesión para continuar' };
  if (!contractId) return { status: 400, error: 'Falta contractId' };
  if (isBrowserOnlyId(contractId)) {
    return { status: 409, error: 'Este contrato no está guardado en tu cuenta. Generalo nuevamente con la sesión iniciada.' };
  }
  const contract = await prisma.generatedContract.findUnique({ where: { id: contractId } });
  if (!contract) return { status: 404, error: 'Contrato no encontrado' };
  if (!isOwnerOrAdmin(user, contract)) return { status: 403, error: 'No tenés acceso a este contrato' };
  if (!isContractPaid(contract)) {
    await prisma.generatedContract.update({
      where: { id: contractId },
      data: { status: 'paid', payment_method: paymentMethod },
    });
  }
  return { ok: true };
}

const QA_DISABLED_RESPONSE = { error: 'La pasarela de pago todavía no está configurada en este entorno.' };

// 5. createStripeCheckout (modo QA: aprobación instantánea)
router.post('/createStripeCheckout', async (req, res) => {
  try {
    if (!QA_PAYMENTS_ENABLED) return res.status(503).json(QA_DISABLED_RESPONSE);
    const { contractId } = req.body || {};
    const result = await markContractPaid(req.user, contractId, 'single');
    if (!result.ok) return res.status(result.status).json({ error: result.error });
    const origin = req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.json({ url: `${origin}/mi-cuenta/contrato/${contractId}` });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// 6. verifyStripePayment (modo QA)
router.post('/verifyStripePayment', async (req, res) => {
  try {
    if (!QA_PAYMENTS_ENABLED) return res.status(503).json(QA_DISABLED_RESPONSE);
    const { contractId } = req.body || {};
    const result = await markContractPaid(req.user, contractId, 'single');
    if (!result.ok) return res.status(result.status).json({ error: result.error });
    return res.json({ success: true, status: 'paid' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// 7. syncSubscriptionStatus
router.post('/syncSubscriptionStatus', async (req, res) => {
  const status = req.user?.subscription_status || 'none';
  return res.json({
    subscription_status: status,
    has_subscription: hasActiveSubscription(req.user),
    has_customer: !!req.user?.stripe_customer_id,
    expires_at: req.user?.subscription_expires_at || null,
  });
});

// 8. createStripeCustomerPortal
router.post('/createStripeCustomerPortal', async (req, res) => {
  const origin = req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:5173';
  return res.json({ url: `${origin}/mi-cuenta` });
});

// 9. simulatePayment (sólo QA)
router.post('/simulatePayment', async (req, res) => {
  try {
    if (!QA_PAYMENTS_ENABLED) return res.status(403).json({ error: 'Simulación de pagos deshabilitada en producción' });
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Iniciá sesión para continuar' });
    const { contractId, type = 'single' } = req.body || {};

    if (type === 'subscription') {
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { subscription_status: 'active' },
      });
      return res.json({ success: true, type, subscription_status: updatedUser?.subscription_status || 'active' });
    }

    const result = await markContractPaid(user, contractId, 'single');
    if (!result.ok) return res.status(result.status).json({ error: result.error });
    return res.json({ success: true, contractId, type, status: 'paid', subscription_status: user.subscription_status || 'none' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
