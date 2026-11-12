import { Router } from 'express';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs/promises';
import { AlignmentType, Document, Footer, PageNumber, Packer, Paragraph, TextRun } from 'docx';
import { prisma } from '../db.js';
import { buildStrictContract } from '../services/contractGenerator.js';
import { Resend } from 'resend';
import Stripe from 'stripe';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

const router = Router();

// Pagos simulados (QA): activos por defecto para evaluación hasta integrar Stripe en producción
const QA_PAYMENTS_ENABLED =
  process.env.NODE_ENV !== 'production' || process.env.ENABLE_QA_PAYMENTS !== 'false';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

const isAdmin = (user) => user?.role === 'admin';
const isGuestOwner = (createdById) =>
  !createdById || createdById === 'guest' || String(createdById).startsWith('guest_');
const isBrowserOnlyId = (id) => typeof id === 'string' && id.startsWith('local_');

function canAccessContract(user, contract, token = null) {
  if (!contract) return false;
  if (isAdmin(user)) return true;
  if (token && (contract.signing_token_a === token || contract.signing_token_b === token)) return true;
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
    const { contractId, generatedText, templateName, contractStatus } = req.body || {};
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
      // Contrato guardado en el navegador (local_*) o cuando la DB se reinició en modo memoria
      const localPaid = ['paid', 'downloaded', 'signed'].includes(contractStatus);
      if (!isAdmin(user) && !hasActiveSubscription(user) && !localPaid) {
        return res.status(402).json({ error: 'Este contrato requiere pago o una membresía activa para descargarse' });
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
      contract_data,
    } = req.body;

    if (!contract_id || !signer_name || !party_role || !signature_image) {
      return res.status(400).json({ error: 'Faltan datos requeridos: contract_id, signer_name, party_role, signature_image' });
    }
    if (!['part_a', 'part_b'].includes(party_role)) {
      return res.status(400).json({ error: 'party_role inválido' });
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

    let contract = await prisma.generatedContract.findUnique({ where: { id: contract_id } }).catch(() => null);
    if (!contract && contract_data && typeof contract_data === 'object') {
      try {
        contract = await prisma.generatedContract.create({
          data: {
            id: contract_id,
            created_by_id: user.id,
            template_id: contract_data.template_id || 'contrato',
            template_name: contract_data.template_name || 'Contrato Legal',
            category: contract_data.category || 'general',
            province: contract_data.province || 'Argentina',
            form_data: contract_data.form_data || {},
            generated_text: contract_data.generated_text || '',
            status: contract_data.status || 'paid',
            signature_status: contract_data.signature_status || 'not_required',
          },
        });
      } catch (_) {}
    }
    if (!contract) return res.status(404).json({ error: 'Contrato no encontrado' });
    const tokenMatches =
      signing_token &&
      ((contract.signing_token_a && contract.signing_token_a === signing_token) ||
       (contract.signing_token_b && contract.signing_token_b === signing_token));

    const isPartyBSigning =
      party_role === 'part_b' &&
      !contract.signature_part_b?.signed_at &&
      (contract.signature_part_a?.signed_at || isContractPaid(contract));

    const isGuest = isGuestOwner(contract.created_by_id);
    const canSign = isOwnerOrAdmin(user, contract) || isGuest || tokenMatches || isPartyBSigning;
    if (!canSign) {
      return res.status(403).json({ error: 'No tenés permisos para firmar este contrato' });
    }

    if (!isAdmin(user) && !tokenMatches && !isPartyBSigning && !isContractPaid(contract) && !hasActiveSubscription(user)) {
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
        ...(isGuest ? { created_by_id: user.id } : {}),
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
    const frontendUrl = process.env.FRONTEND_URL || 'https://micontratos.com';

    if (resend) {
      await resend.emails.send({
        from: 'miContratos <hola@micontratos.com>',
        to: [recipientEmail],
        subject: `Tu contrato: ${contractTitle}`,
        html: `
          <h1>¡Hola!</h1>
          <p>Tu contrato <strong>${escapeHtml(contractTitle)}</strong> se ha generado exitosamente y está listo para descargar o firmar.</p>
          <p><a href="${frontendUrl}/mi-cuenta/contrato/${encodeURIComponent(contractId)}">Ver contrato</a></p>
          <p>Gracias por usar miContratos.</p>
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
    return { ok: true, localOnly: true };
  }
  const contract = await prisma.generatedContract.findUnique({ where: { id: contractId } });
  if (!contract) {
    // Si la base en memoria se reinició, permitir marcar como pagado en cliente
    return { ok: true, localOnly: true };
  }
  const isOwner = isOwnerOrAdmin(user, contract) || isGuestOwner(contract.created_by_id);
  if (!isOwner) return { status: 403, error: 'No tenés acceso a este contrato' };
  
  await prisma.generatedContract.update({
    where: { id: contractId },
    data: {
      status: 'paid',
      payment_method: paymentMethod,
      ...(isGuestOwner(contract.created_by_id) ? { created_by_id: user.id } : {}),
    },
  });
  return { ok: true };
}

const QA_DISABLED_RESPONSE = { error: 'La pasarela de pago todavía no está configurada en este entorno.' };

// 5. createStripeCheckout (producción con Stripe o modo QA de respaldo)
router.post('/createStripeCheckout', async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Iniciá sesión para continuar con el pago.' });
    const { contractId, type = 'single', templateName, templateId } = req.body || {};
    const origin = req.headers.origin || process.env.FRONTEND_URL || 'https://micontratos.com';

    // Si Stripe está configurado con clave secreta, creamos Checkout Session real
    if (stripe) {
      if (type === 'subscription') {
        const session = await stripe.checkout.sessions.create({
          customer_email: user.email,
          payment_method_types: ['card'],
          mode: 'subscription',
          line_items: [
            {
              price_data: {
                currency: 'ars',
                product_data: {
                  name: 'miContratos - Plan Profesional Ilimitado',
                  description: 'Descargas ilimitadas de contratos en Word/PDF, firmas digitales y certificados',
                },
                unit_amount: 999000, // $9.990 ARS (en centavos)
                recurring: { interval: 'month' },
              },
              quantity: 1,
            },
          ],
          metadata: {
            userId: user.id,
            userEmail: user.email,
            type: 'subscription',
          },
          success_url: `${origin}/mi-cuenta?session_id={CHECKOUT_SESSION_ID}&subscription=success`,
          cancel_url: `${origin}/mi-cuenta?subscription=cancelled`,
        });
        return res.json({ url: session.url });
      }

      // Pago único de un documento
      if (!contractId) return res.status(400).json({ error: 'Falta contractId para el pago del documento.' });
      const contract = !isBrowserOnlyId(contractId)
        ? await prisma.generatedContract.findUnique({ where: { id: contractId } }).catch(() => null)
        : null;

      // Consultamos precio de plantilla si existe en base de datos
      let priceAmount = 4990;
      const slugToLookup = contract?.template_id || templateId;
      if (slugToLookup) {
        try {
          const tmpl = await prisma.contractTemplate.findUnique({ where: { slug: slugToLookup } });
          if (tmpl?.price && Number(tmpl.price) > 0) priceAmount = Number(tmpl.price);
        } catch (_) {}
      }

      const effectiveId = contract?.id || contractId;
      const effectiveName = contract?.template_name || templateName || 'Documento Legal';

      const session = await stripe.checkout.sessions.create({
        customer_email: user.email,
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: 'ars',
              product_data: {
                name: `Contrato: ${effectiveName}`,
                description: 'Descarga Word (.docx) editable, PDF oficial y acceso permanente en tu cuenta',
              },
              unit_amount: Math.round(priceAmount * 100), // En centavos
            },
            quantity: 1,
          },
        ],
        metadata: {
          contractId: effectiveId,
          userId: user.id,
          userEmail: user.email,
          type: 'single',
        },
        success_url: `${origin}/mi-cuenta/contrato/${effectiveId}?session_id={CHECKOUT_SESSION_ID}&payment=success`,
        cancel_url: `${origin}/preview/${effectiveId}?payment=cancelled`,
      });

      return res.json({ url: session.url });
    }

    // Modo QA si Stripe no está activo
    if (QA_PAYMENTS_ENABLED) {
      if (type === 'subscription') {
        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: { subscription_status: 'active' },
        });
        return res.json({ success: true, url: `${origin}/mi-cuenta`, subscription_status: updatedUser.subscription_status });
      }
      const result = await markContractPaid(user, contractId, 'single');
      if (!result.ok) return res.status(result.status).json({ error: result.error });
      return res.json({ url: `${origin}/mi-cuenta/contrato/${contractId}`, success: true });
    }

    return res.status(503).json(QA_DISABLED_RESPONSE);
  } catch (error) {
    console.error('Error in createStripeCheckout:', error);
    return res.status(500).json({ error: error.message || 'Error al conectar con la pasarela de pagos Stripe' });
  }
});

// 6. verifyStripePayment (verifica sesión de Stripe Checkout y actualiza DB)
router.post('/verifyStripePayment', async (req, res) => {
  try {
    const user = req.user;
    const { contractId, sessionId } = req.body || {};

    if (stripe && sessionId) {
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.payment_status === 'paid' || session.status === 'complete') {
          // Si fue pago único de contrato
          const targetContractId = session.metadata?.contractId || contractId;
          if (targetContractId) {
            await prisma.generatedContract.update({
              where: { id: targetContractId },
              data: {
                status: 'paid',
                payment_method: 'stripe',
                ...(user ? { created_by_id: user.id } : {}),
              },
            }).catch(() => {});
          }
          // Si fue suscripción
          const targetUserId = user?.id || session.metadata?.userId;
          if (session.metadata?.type === 'subscription' && targetUserId) {
            await prisma.user.update({
              where: { id: targetUserId },
              data: {
                subscription_status: 'active',
                stripe_customer_id: typeof session.customer === 'string' ? session.customer : session.customer?.id,
                stripe_subscription_id: typeof session.subscription === 'string' ? session.subscription : session.subscription?.id,
              },
            }).catch(() => {});
          }
          return res.json({ success: true, status: 'paid' });
        }
      } catch (err) {
        console.warn('Verificación en Stripe falló:', err.message);
      }
    }

    // Respaldo para QA
    if (QA_PAYMENTS_ENABLED && contractId) {
      const result = await markContractPaid(user, contractId, 'single');
      if (!result.ok) return res.status(result.status).json({ error: result.error });
      return res.json({ success: true, status: 'paid' });
    }

    return res.json({ success: false, status: 'pending' });
  } catch (error) {
    console.error('Error in verifyStripePayment:', error);
    return res.status(500).json({ error: error.message });
  }
});

// 7. syncSubscriptionStatus
router.post('/syncSubscriptionStatus', async (req, res) => {
  const user = req.user;
  if (!user) return res.json({ subscription_status: 'none', has_subscription: false });

  let status = user.subscription_status || 'none';
  let expiresAt = user.subscription_expires_at || null;

  // Si tiene cliente o suscripción en Stripe, consultamos el estado real
  if (stripe && user.stripe_subscription_id) {
    try {
      const sub = await stripe.subscriptions.retrieve(user.stripe_subscription_id);
      status = sub.status === 'active' || sub.status === 'trialing' ? 'active' : sub.status;
      expiresAt = sub.current_period_end ? new Date(sub.current_period_end * 1000) : expiresAt;
      if (status !== user.subscription_status) {
        await prisma.user.update({
          where: { id: user.id },
          data: { subscription_status: status, subscription_expires_at: expiresAt },
        });
      }
    } catch (e) {
      console.warn('Error sync subscription with Stripe:', e.message);
    }
  }

  return res.json({
    subscription_status: status,
    has_subscription: status === 'active',
    has_customer: !!user.stripe_customer_id,
    expires_at: expiresAt,
  });
});

// 8. createStripeCustomerPortal
router.post('/createStripeCustomerPortal', async (req, res) => {
  try {
    const origin = req.headers.origin || process.env.FRONTEND_URL || 'https://micontratos.com';
    const user = req.user;
    if (stripe && user?.stripe_customer_id) {
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: user.stripe_customer_id,
        return_url: `${origin}/mi-cuenta`,
      });
      return res.json({ url: portalSession.url });
    }
    return res.json({ url: `${origin}/mi-cuenta` });
  } catch (err) {
    console.error('Error in createStripeCustomerPortal:', err);
    return res.status(500).json({ error: err.message });
  }
});

// 9. stripeWebhook (Recepción de eventos en tiempo real)
router.post('/stripeWebhook', async (req, res) => {
  if (!stripe) return res.status(503).send('Stripe no configurado');

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers['stripe-signature'];
  let event = req.body;

  if (webhookSecret && signature && req.rawBody) {
    try {
      event = stripe.webhooks.constructEvent(req.rawBody, signature, webhookSecret);
    } catch (err) {
      console.error('⚠️ Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const meta = session.metadata || {};
        if (meta.type === 'single' && meta.contractId) {
          await prisma.generatedContract.update({
            where: { id: meta.contractId },
            data: { status: 'paid', payment_method: 'stripe' },
          }).catch(() => {});
        }
        if (meta.type === 'subscription' && meta.userId) {
          await prisma.user.update({
            where: { id: meta.userId },
            data: {
              subscription_status: 'active',
              stripe_customer_id: typeof session.customer === 'string' ? session.customer : session.customer?.id,
              stripe_subscription_id: typeof session.subscription === 'string' ? session.subscription : session.subscription?.id,
            },
          }).catch(() => {});
        }
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const customerId = sub.customer;
        const newStatus = sub.status === 'active' || sub.status === 'trialing' ? 'active' : sub.status;
        const user = await prisma.user.findFirst({ where: { stripe_customer_id: customerId } });
        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              subscription_status: newStatus,
              subscription_expires_at: sub.current_period_end ? new Date(sub.current_period_end * 1000) : null,
            },
          });
        }
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        if (invoice.customer) {
          const user = await prisma.user.findFirst({ where: { stripe_customer_id: invoice.customer } });
          if (user && user.subscription_status !== 'active') {
            await prisma.user.update({
              where: { id: user.id },
              data: { subscription_status: 'active' },
            });
          }
        }
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        if (invoice.customer) {
          const user = await prisma.user.findFirst({ where: { stripe_customer_id: invoice.customer } });
          if (user) {
            await prisma.user.update({
              where: { id: user.id },
              data: { subscription_status: 'past_due' },
            });
          }
        }
        break;
      }
    }
    return res.json({ received: true });
  } catch (err) {
    console.error('Error procesando webhook de Stripe:', err);
    return res.status(500).json({ error: 'Error procesando webhook' });
  }
});

// 10. simulatePayment (sólo QA)
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
