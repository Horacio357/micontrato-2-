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

function getModel(entityName) {
  const model = MODEL_MAP[entityName];
  if (!model) {
    throw new Error(`Entidad "${entityName}" no válida`);
  }
  return model;
}

// List
router.get('/:entity', async (req, res) => {
  try {
    const model = getModel(req.params.entity);
    const { sort, limit } = req.query;

    let orderBy = undefined;
    if (sort) {
      const field = sort.startsWith('-') ? sort.slice(1) : sort;
      const direction = sort.startsWith('-') ? 'desc' : 'asc';
      // Map created_date to created_at
      const mappedField = field === 'created_date' ? 'created_at' : field;
      orderBy = { [mappedField]: direction };
    }

    const take = limit ? parseInt(limit, 10) : undefined;
    const items = await model.findMany({ orderBy, take });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Filter (via POST or GET query)
router.post('/:entity/filter', async (req, res) => {
  try {
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
    const items = await model.findMany({ where: criteria, orderBy, take });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single
router.get('/:entity/:id', async (req, res) => {
  try {
    const model = getModel(req.params.entity);
    const item = await model.findUnique({ where: { id: req.params.id } });
    if (!item) {
      return res.status(404).json({ error: 'Item no encontrado' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create
router.post('/:entity', async (req, res) => {
  try {
    const model = getModel(req.params.entity);
    const payload = req.body;
    if (req.user && !payload.created_by_id) {
      payload.created_by_id = req.user.id;
    }
    const created = await model.create({ data: payload });
    res.json(created);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update
router.put('/:entity/:id', async (req, res) => {
  try {
    const model = getModel(req.params.entity);
    const updated = await model.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete
router.delete('/:entity/:id', async (req, res) => {
  try {
    const model = getModel(req.params.entity);
    await model.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
