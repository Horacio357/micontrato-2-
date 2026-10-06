import { Router } from 'express';
import { prisma } from '../db.js';

const router = Router();

const MODEL_MAP = {
  GeneratedContract: prisma.generatedContract,
  ContractTemplate: prisma.contractTemplate,
  ContractSignature: prisma.contractSignature,
  ContractFeedback: prisma.contractFeedback,
  ContractGenerationError: prisma.contractGenerationError,
  LegalDocument: prisma.legalDocument,
  WaitlistEmail: prisma.waitlistEmail,
  User: prisma.user,
};

const ALLOWED_FIELDS = {
  GeneratedContract: [
    'id', 'created_by_id', 'template_id', 'template_name', 'category', 'province',
    'form_data', 'generated_text', 'status', 'payment_method', 'pdf_url', 'docx_url',
    'signature_status', 'signature_part_a', 'signature_part_b', 'signing_token_a',
    'signing_token_b', 'created_at', 'updated_at'
  ],
  ContractTemplate: [
    'id', 'name', 'slug', 'category', 'price', 'description', 'input_schema',
    'template_blocks', 'is_active', 'created_at', 'updated_at'
  ],
  ContractSignature: [
    'id', 'contract_id', 'signer_name', 'signer_email', 'signer_dni', 'party_role',
    'signature_image', 'signed_at', 'ip_address', 'user_agent', 'geolocation',
    'signature_hash', 'terms_accepted', 'declaration_accepted'
  ],
  ContractFeedback: [
    'id', 'contract_id', 'user_id', 'rating', 'comment', 'created_at'
  ],
  ContractGenerationError: [
    'id', 'user_id', 'template_id', 'error_message', 'form_data', 'created_at'
  ],
  LegalDocument: [
    'id', 'document_type', 'title', 'content', 'updated_at'
  ],
  WaitlistEmail: [
    'id', 'email', 'province', 'created_at'
  ],
  User: [
    'id', 'email', 'name', 'role', 'subscription_status',
    'stripe_customer_id', 'stripe_subscription_id', 'subscription_expires_at',
    'created_at', 'updated_at'
  ]
};

function getModel(entityName) {
  const model = MODEL_MAP[entityName];
  if (!model) {
    throw new Error(`Entidad "${entityName}" no válida`);
  }
  return model;
}

function sanitizePayload(entityName, rawPayload) {
  const allowed = ALLOWED_FIELDS[entityName];
  if (!allowed) return rawPayload;
  const clean = {};
  for (const key of Object.keys(rawPayload)) {
    if (allowed.includes(key)) {
      clean[key] = rawPayload[key];
    }
  }
  return clean;
}

function checkAccess(req, entityName, method) {
  const user = req.user;
  const role = user?.role;
  
  if (role === 'admin') return true;

  if (method === 'GET' || method === 'POST_FILTER') {
    if (entityName === 'ContractTemplate' || entityName === 'LegalDocument') return true;
    return !!user;
  }
  
  if (method === 'POST') {
    if (!user) return false;
    if (entityName === 'User' || entityName === 'ContractTemplate' || entityName === 'LegalDocument') return false;
    return true;
  }
  
  if (method === 'PUT' || method === 'DELETE') {
    if (!user) return false;
    if (entityName === 'User' || entityName === 'ContractTemplate' || entityName === 'LegalDocument') return false;
    return true;
  }
  
  return false;
}

// List
router.get('/:entity', async (req, res) => {
  try {
    if (!checkAccess(req, req.params.entity, 'GET')) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    const model = getModel(req.params.entity);
    const { sort, limit } = req.query;

    let orderBy = undefined;
    if (sort) {
      const field = sort.startsWith('-') ? sort.slice(1) : sort;
      const direction = sort.startsWith('-') ? 'desc' : 'asc';
      const mappedField = field === 'created_date' ? 'created_at' : field;
      orderBy = { [mappedField]: direction };
    }

    const take = limit ? parseInt(limit, 10) : undefined;
    const where = {};
    if (req.params.entity === 'GeneratedContract' && req.user?.role !== 'admin') {
      where.created_by_id = req.user.id;
    }
    const items = await model.findMany({ where, orderBy, take });
    res.json(items);
  } catch (error) {
    console.error(`Error list ${req.params.entity}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Filter (via POST or GET query)
router.post('/:entity/filter', async (req, res) => {
  try {
    if (!checkAccess(req, req.params.entity, 'POST_FILTER')) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    const model = getModel(req.params.entity);
    const { criteria = {}, sort, limit } = req.body;

    let orderBy = undefined;
    if (sort) {
      const field = sort.startsWith('-') ? sort.slice(1) : sort;
      const direction = sort.startsWith('-') ? 'desc' : 'asc';
      const mappedField = field === 'created_date' ? 'created_at' : field;
      orderBy = { [mappedField]: direction };
    }

    const take = limit ? parseInt(limit, 10) : undefined;
    const cleanCriteria = sanitizePayload(req.params.entity, criteria);
    if (req.params.entity === 'GeneratedContract' && req.user && req.user.role !== 'admin') {
      cleanCriteria.created_by_id = req.user.id;
    }
    const items = await model.findMany({ where: cleanCriteria, orderBy, take });
    res.json(items);
  } catch (error) {
    console.error(`Error filter ${req.params.entity}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Get single
router.get('/:entity/:id', async (req, res) => {
  try {
    if (!checkAccess(req, req.params.entity, 'GET')) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    const model = getModel(req.params.entity);
    const item = await model.findUnique({ where: { id: req.params.id } });
    if (!item) {
      return res.status(404).json({ error: 'Item no encontrado' });
    }
    if (req.params.entity === 'GeneratedContract' && req.user?.role !== 'admin' && item.created_by_id !== req.user.id) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create
router.post('/:entity', async (req, res) => {
  try {
    if (!checkAccess(req, req.params.entity, 'POST')) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    const entityName = req.params.entity;
    const model = getModel(entityName);
    const rawPayload = { ...req.body };
    const payload = sanitizePayload(entityName, rawPayload);

    if (entityName === 'GeneratedContract') {
      payload.created_by_id = req.user.id;
      if (!payload.status) {
        payload.status = 'pending_payment';
      }
      if (!payload.form_data) {
        payload.form_data = {};
      }
      if (typeof payload.form_data === 'string') {
        try {
          payload.form_data = JSON.parse(payload.form_data);
        } catch (_) {
          payload.form_data = {};
        }
      }
    }

    const created = await model.create({ data: payload });
    res.json(created);
  } catch (error) {
    console.error(`Error al crear entidad ${req.params.entity}:`, error);
    res.status(500).json({ error: error.message || 'Error al guardar en la base de datos' });
  }
});

// Update
router.put('/:entity/:id', async (req, res) => {
  try {
    if (!checkAccess(req, req.params.entity, 'PUT')) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    const entityName = req.params.entity;
    const model = getModel(entityName);
    
    if (entityName === 'GeneratedContract' && req.user?.role !== 'admin') {
      const existing = await model.findUnique({ where: { id: req.params.id } });
      if (!existing || existing.created_by_id !== req.user.id) {
        return res.status(403).json({ error: 'Acceso denegado' });
      }
    }

    const payload = sanitizePayload(entityName, req.body);

    const updated = await model.update({
      where: { id: req.params.id },
      data: payload,
    });
    res.json(updated);
  } catch (error) {
    console.error(`Error update ${req.params.entity}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Delete
router.delete('/:entity/:id', async (req, res) => {
  try {
    if (!checkAccess(req, req.params.entity, 'DELETE')) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    const model = getModel(req.params.entity);

    if (req.params.entity === 'GeneratedContract' && req.user?.role !== 'admin') {
      const existing = await model.findUnique({ where: { id: req.params.id } });
      if (!existing || existing.created_by_id !== req.user.id) {
        return res.status(403).json({ error: 'Acceso denegado' });
      }
    }
    await model.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
