import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('FATAL ERROR: JWT_SECRET environment variable is required');
}

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = (authHeader && authHeader.split(' ')[1]) || req.query.token;

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, async (err, payload) => {
    if (err || !payload?.id) {
      req.user = null;
      return next();
    }
    try {
      const user = await prisma.user.findUnique({ where: { id: payload.id } });
      req.user = user || null;
    } catch {
      req.user = null;
    }
    next();
  });
}

export function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
  }
  next();
}

router.get('/me', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { password, ...safeUser } = req.user;
  res.json(safeUser);
});

// Sólo se pueden "reclamar" contratos creados como invitado (nunca los de otro usuario)
async function claimGuestContract(contractId, userId) {
  if (!contractId || typeof contractId !== 'string') return;
  try {
    const contract = await prisma.generatedContract.findUnique({ where: { id: contractId } });
    const owner = contract?.created_by_id;
    const isGuest = contract && (!owner || owner === 'guest' || String(owner).startsWith('guest_'));
    if (isGuest) {
      await prisma.generatedContract.update({
        where: { id: contractId },
        data: { created_by_id: userId },
      });
    }
  } catch (_) {
    // no bloquear el login por un fallo al reclamar
  }
}

router.post('/register', async (req, res) => {
  try {
    const { email, password, name, claimContractId } = req.body;
    const role = 'user';
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existing) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        name: name || email.split('@')[0],
        role,
      },
    });

    await claimGuestContract(claimContractId, user.id);

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    const { password: _, ...safeUser } = user;
    res.json({ user: safeUser, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password, claimContractId } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      return res.status(400).json({ error: 'Credenciales inválidas' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ error: 'Credenciales inválidas' });
    }

    await claimGuestContract(claimContractId, user.id);

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    const { password: _, ...safeUser } = user;
    res.json({ user: safeUser, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/logout', (req, res) => {
  res.json({ ok: true });
});

export default router;
