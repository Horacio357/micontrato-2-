import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';

const router = Router();
const JWT_SECRET =
  process.env.JWT_SECRET ||
  (process.env.NODE_ENV !== 'production'
    ? 'micontratos-dev-secret-key-2026'
    : 'micontratos-provisional-secret-key-railway');

if (!process.env.JWT_SECRET) {
  console.warn('⚠️ AVISO: Variable JWT_SECRET no definida. Se utiliza clave provisional de respaldo.');
}

export function isSuperAdminEmail(email = '') {
  if (!email || typeof email !== 'string') return false;
  const normalized = email.toLowerCase().trim();
  const configuredAdmins = (process.env.SUPER_ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (process.env.NODE_ENV !== 'production') {
    return configuredAdmins.includes(normalized) || ['admin@micontratos.com', 'admin@micontrato.com.ar'].includes(normalized);
  }
  return configuredAdmins.includes(normalized);
}

const isProductionStrict = () =>
  process.env.NODE_ENV === 'production' && process.env.ENABLE_QA_PAYMENTS !== 'true';

const QA_DEMO_EMAILS = ['demo@micontrato.com.ar', 'sinpago@micontrato.com.ar'];

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

function formatAuthError(error) {
  const msg = String(error?.message || '');
  if (msg.includes('prisma.') || msg.includes('database server') || msg.includes('ECONNREFUSED')) {
    return 'El servicio de base de datos se está reconectando. Por favor intentá de nuevo en unos segundos.';
  }
  return msg || 'Error al procesar la solicitud';
}

router.post('/register', async (req, res) => {
  try {
    const { email, password, name, claimContractId } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }
    const normalizedEmail = email.toLowerCase().trim();
    if (isSuperAdminEmail(normalizedEmail)) {
      return res.status(403).json({
        error: 'Este correo está reservado para administración. Configurá ADMIN_INITIAL_PASSWORD en el servidor o iniciá sesión.',
      });
    }
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        name: name || normalizedEmail.split('@')[0],
        role: 'user',
      },
    });

    await claimGuestContract(claimContractId, user.id);

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    const { password: _, ...safeUser } = user;
    res.json({ user: safeUser, token });
  } catch (error) {
    res.status(500).json({ error: formatAuthError(error) });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password, claimContractId } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }
    const normalizedEmail = email.toLowerCase().trim();
    if (isProductionStrict() && QA_DEMO_EMAILS.includes(normalizedEmail)) {
      return res.status(403).json({ error: 'Las cuentas de prueba QA están deshabilitadas en producción.' });
    }
    let user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      return res.status(400).json({ error: 'Credenciales inválidas' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ error: 'Credenciales inválidas' });
    }
    if (isProductionStrict() && normalizedEmail === 'admin@micontratos.com' && password === 'admin123') {
      return res.status(403).json({
        error: 'Contraseña por defecto bloqueada en producción. Configurá ADMIN_INITIAL_PASSWORD en Railway.',
      });
    }

    // Auto-promover si su email está en SUPER_ADMIN_EMAILS (no registrable públicamente)
    if (user.role !== 'admin' && isSuperAdminEmail(normalizedEmail)) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: 'admin' },
      });
    }

    await claimGuestContract(claimContractId, user.id);

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    const { password: _, ...safeUser } = user;
    res.json({ user: safeUser, token });
  } catch (error) {
    res.status(500).json({ error: formatAuthError(error) });
  }
});

router.post('/logout', (req, res) => {
  res.json({ ok: true });
});

export default router;
