import { Router } from 'express';
import crypto from 'node:crypto';
import { AlignmentType, Document, Footer, PageNumber, Packer, Paragraph, TextRun } from 'docx';
import { prisma } from '../db.js';
import { buildStrictContract } from '../services/contractGenerator.js';

const router = Router();

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
    const { contractId, generatedText, templateName } = req.body;
    if (!contractId && !generatedText) return res.status(400).json({ error: 'Falta contractId o generatedText' });

    let source = generatedText || '';
    let docTemplateName = templateName || 'contrato';

    if (contractId && !contractId.startsWith('local_')) {
      try {
        const contract = await prisma.generatedContract.findUnique({ where: { id: contractId } });
        if (contract) {
          if (contract.generated_text) source = contract.generated_text;
          if (contract.template_name) docTemplateName = contract.template_name;
        }
      } catch (dbErr) {
        console.warn('DB lookup failed in exportContractDocx, using fallback payload:', dbErr);
      }
    }

    let text = source;
    try {
      const parsed = JSON.parse(source);
      text = typeof parsed.text === 'string' ? parsed.text : (parsed.blocks || []).map((block) => block.content).join('\n\n');
    } catch {
      // Plain text
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

    const contract = await prisma.generatedContract.findUnique({ where: { id: contract_id } });
    if (!contract) {
      return res.status(404).json({ error: 'Contrato no encontrado' });
    }

    const signedAt = new Date().toISOString();
    const payload = [
      contract.generated_text || '',
      signer_name || '',
      signer_email || '',
      signer_dni || '',
      party_role || '',
      signedAt,
    ].join('|');

    const signatureHash = crypto.createHash('sha256').update(payload).digest('hex').toUpperCase();
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Desconocido';

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

    const sigFieldKey = party_role === 'part_a' ? 'signature_part_a' : 'signature_part_b';
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
    return res.status(500).json({ error: error.message });
  }
});

// 4. sendContractEmail
router.post('/sendContractEmail', async (req, res) => {
  try {
    const user = req.user;
    const { contractId } = req.body;
    if (!contractId) return res.status(400).json({ error: 'Falta contractId' });

    const contract = await prisma.generatedContract.findUnique({ where: { id: contractId } });
    if (!contract) return res.status(404).json({ error: 'Contrato no encontrado' });

    const recipientEmail = user?.email || 'usuario@micontrato.com';
    return res.json({ ok: true, sent_to: recipientEmail });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// 5. createStripeCheckout (Gratis / Instantáneo)
router.post('/createStripeCheckout', async (req, res) => {
  try {
    const { contractId } = req.body;
    if (!contractId) return res.status(400).json({ error: 'Falta contractId' });
    const origin = req.headers.origin || 'http://localhost:5173';

    const contract = await prisma.generatedContract.findUnique({ where: { id: contractId } });
    if (!contract) return res.status(404).json({ error: 'Contrato no encontrado' });

    if (['draft', 'pending_payment'].includes(contract.status)) {
      await prisma.generatedContract.update({
        where: { id: contractId },
        data: { status: 'paid', payment_method: 'single' },
      });
    }

    return res.json({ url: `${origin}/mi-cuenta/contrato/${contractId}` });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// 6. verifyStripePayment
router.post('/verifyStripePayment', async (req, res) => {
  try {
    const { contractId } = req.body;
    if (contractId) {
      await prisma.generatedContract.update({
        where: { id: contractId },
        data: { status: 'paid' },
      });
    }
    return res.json({ success: true, status: 'paid' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// 7. syncSubscriptionStatus
router.post('/syncSubscriptionStatus', async (req, res) => {
  return res.json({ subscription_status: req.user?.subscription_status || 'none' });
});

// 8. createStripeCustomerPortal
router.post('/createStripeCustomerPortal', async (req, res) => {
  const origin = req.headers.origin || 'http://localhost:5173';
  return res.json({ url: `${origin}/mi-cuenta` });
});

export default router;
