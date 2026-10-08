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

// Campos de GeneratedContract que un usuario común NUNCA puede escribir directamente
// (el estado de pago y las firmas sólo se modifican desde /api/functions).
const PROTECTED_CONTRACT_FIELDS = [
  'id', 'created_by_id', 'status', 'payment_method', 'signature_status',
  'signature_part_a', 'signature_part_b', 'signing_token_a', 'signing_token_b',
  'created_at', 'updated_at',
];

// Entidades públicas de sólo lectura
const PUBLIC_READ = ['ContractTemplate', 'LegalDocument'];
// Entidades que sólo puede leer/listar un administrador
const ADMIN_READ_ONLY = ['User', 'WaitlistEmail', 'ContractGenerationError', 'ContractFeedback'];
// Entidades que sólo puede escribir un administrador
const ADMIN_WRITE_ONLY = ['User', 'ContractTemplate', 'LegalDocument', 'ContractSignature'];
// Entidades que cualquier visitante puede crear
const PUBLIC_CREATE = ['GeneratedContract', 'WaitlistEmail'];

const isAdmin = (req) => req.user?.role === 'admin';
const isGuestOwner = (createdById) =>
  !createdById || createdById === 'guest' || String(createdById).startsWith('guest_');

function canAccessContract(req, contract) {
  if (!contract) return false;
  if (isAdmin(req)) return true;
  if (isGuestOwner(contract.created_by_id)) return true;
  return !!req.user && contract.created_by_id === req.user.id;
}

function getModel(entityName) {
  const model = MODEL_MAP[entityName];
  if (!model) {
    const err = new Error(`Entidad "${entityName}" no válida`);
    err.status = 400;
    throw err;
  }
  return model;
}

function sanitizePayload(entityName, rawPayload = {}) {
  const allowed = ALLOWED_FIELDS[entityName];
  if (!allowed) return {};
  const clean = {};
  for (const key of Object.keys(rawPayload || {})) {
    if (allowed.includes(key)) {
      clean[key] = rawPayload[key];
    }
  }
  return clean;
}

function stripProtectedContractFields(payload) {
  for (const key of PROTECTED_CONTRACT_FIELDS) delete payload[key];
  return payload;
}

function checkAccess(req, entityName, method) {
  if (!MODEL_MAP[entityName]) return true; // getModel devolverá 400
  if (isAdmin(req)) return true;
  const user = req.user;

  if (method === 'GET' || method === 'POST_FILTER') {
    if (PUBLIC_READ.includes(entityName)) return true;
    if (ADMIN_READ_ONLY.includes(entityName)) return false;
    if (entityName === 'GeneratedContract') return true; // filtrado por dueño más abajo
    return !!user;
  }

  if (method === 'POST') {
    if (PUBLIC_CREATE.includes(entityName)) return true;
    if (!user) return false;
    return !ADMIN_WRITE_ONLY.includes(entityName);
  }

  if (method === 'PUT') {
    if (entityName === 'GeneratedContract') return true; // validado por dueño más abajo
    return false;
  }

  if (method === 'DELETE') {
    return entityName === 'GeneratedContract' && !!user;
  }

  return false;
}

function buildOrderBy(sort) {
  if (!sort) return undefined;
  const field = sort.startsWith('-') ? sort.slice(1) : sort;
  const direction = sort.startsWith('-') ? 'desc' : 'asc';
  const mappedField = field === 'created_date' ? 'created_at' : field;
  return { [mappedField]: direction };
}

function parseTake(limit) {
  const n = parseInt(limit, 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, 500) : undefined;
}

async function filterSignaturesForUser(req, criteria) {
  // Un usuario común sólo puede ver las firmas de un contrato propio
  if (!criteria.contract_id) return null;
  const contract = await prisma.generatedContract.findUnique({ where: { id: criteria.contract_id } });
  if (!canAccessContract(req, contract)) return null;
  return { contract_id: criteria.contract_id };
}

// List
router.get('/:entity', async (req, res) => {
  try {
    const entityName = req.params.entity;
    if (!checkAccess(req, entityName, 'GET')) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    const model = getModel(entityName);
    const where = {};

    if (entityName === 'GeneratedContract' && !isAdmin(req)) {
      if (!req.user) return res.json([]);
      where.created_by_id = req.user.id;
    }
    if (entityName === 'ContractSignature' && !isAdmin(req)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const items = await model.findMany({ where, orderBy: buildOrderBy(req.query.sort), take: parseTake(req.query.limit) });
    res.json(items);
  } catch (error) {
    console.error(`Error list ${req.params.entity}:`, error);
    res.status(error.status || 500).json({ error: error.message });
  }
});

// Filter
router.post('/:entity/filter', async (req, res) => {
  try {
    const entityName = req.params.entity;
    if (!checkAccess(req, entityName, 'POST_FILTER')) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    const model = getModel(entityName);
    const { criteria = {}, sort, limit } = req.body || {};
    let where = sanitizePayload(entityName, criteria);

    if (entityName === 'GeneratedContract' && !isAdmin(req)) {
      // Búsqueda puntual por ID: se permite si es del usuario o es un contrato de invitado
      if (where.id) {
        const item = await model.findUnique({ where: { id: where.id } });
        return res.json(canAccessContract(req, item) ? [item] : []);
      }
      if (!req.user) return res.json([]);
      where.created_by_id = req.user.id;
    }

    if (entityName === 'ContractSignature' && !isAdmin(req)) {
      where = await filterSignaturesForUser(req, where);
      if (!where) return res.json([]);
    }

    const items = await model.findMany({ where, orderBy: buildOrderBy(sort), take: parseTake(limit) });
    res.json(items);
  } catch (error) {
    console.error(`Error filter ${req.params.entity}:`, error);
    res.status(error.status || 500).json({ error: error.message });
  }
});

// Get single
router.get('/:entity/:id', async (req, res) => {
  try {
    const entityName = req.params.entity;
    if (!checkAccess(req, entityName, 'GET')) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    const model = getModel(entityName);
    const item = await model.findUnique({ where: { id: req.params.id } });
    if (!item) {
      return res.status(404).json({ error: 'Item no encontrado' });
    }
    if (entityName === 'GeneratedContract' && !canAccessContract(req, item)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    if (entityName === 'ContractSignature' && !isAdmin(req)) {
      const contract = await prisma.generatedContract.findUnique({ where: { id: item.contract_id } });
      if (!canAccessContract(req, contract)) return res.status(403).json({ error: 'Acceso denegado' });
    }
    res.json(item);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

// Create
router.post('/:entity', async (req, res) => {
  try {
    const entityName = req.params.entity;
    if (!checkAccess(req, entityName, 'POST')) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    const model = getModel(entityName);
    const payload = sanitizePayload(entityName, req.body);

    if (entityName === 'GeneratedContract') {
      if (!isAdmin(req)) stripProtectedContractFields(payload);
      payload.created_by_id = req.user ? req.user.id : `guest_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      if (!payload.status) payload.status = 'pending_payment';
      if (typeof payload.form_data === 'string') {
        try {
          payload.form_data = JSON.parse(payload.form_data);
        } catch (_) {
          payload.form_data = {};
        }
      }
      if (!payload.form_data) payload.form_data = {};
    } else if (!isAdmin(req)) {
      delete payload.id;
      if (entityName === 'ContractFeedback' && req.user) payload.user_id = req.user.id;
    }

    const created = await model.create({ data: payload });
    res.json(created);
  } catch (error) {
    console.error(`Error al crear entidad ${req.params.entity}:`, error);
    res.status(error.status || 500).json({ error: error.message || 'Error al guardar en la base de datos' });
  }
});

// Update
router.put('/:entity/:id', async (req, res) => {
  try {
    const entityName = req.params.entity;
    if (!checkAccess(req, entityName, 'PUT')) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    const model = getModel(entityName);
    const payload = sanitizePayload(entityName, req.body);

    if (entityName === 'GeneratedContract' && !isAdmin(req)) {
      const existing = await model.findUnique({ where: { id: req.params.id } });
      if (!existing) return res.status(404).json({ error: 'Item no encontrado' });
      if (!canAccessContract(req, existing)) {
        return res.status(403).json({ error: 'Acceso denegado' });
      }
      stripProtectedContractFields(payload);
    }
    delete payload.id;

    const updated = await model.update({
      where: { id: req.params.id },
      data: payload,
    });
    res.json(updated);
  } catch (error) {
    console.error(`Error update ${req.params.entity}:`, error);
    res.status(error.status || 500).json({ error: error.message });
  }
});

// Delete
router.delete('/:entity/:id', async (req, res) => {
  try {
    const entityName = req.params.entity;
    if (!checkAccess(req, entityName, 'DELETE')) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    const model = getModel(entityName);

    if (entityName === 'GeneratedContract' && !isAdmin(req)) {
      const existing = await model.findUnique({ where: { id: req.params.id } });
      if (!existing || existing.created_by_id !== req.user.id) {
        return res.status(403).json({ error: 'Acceso denegado' });
      }
    }
    await model.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

export default router;
