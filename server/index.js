import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';
import authRouter, { authenticateToken } from './routes/auth.js';
import entitiesRouter from './routes/entities.js';
import functionsRouter from './routes/functions.js';
import uploadRouter from './routes/upload.js';
import chatRouter from './routes/chat.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://micontratos.com',
  'https://www.micontratos.com',
  'https://micontrato.com.ar',
  'https://www.micontrato.com.ar',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);

    try {
      const hostname = new URL(origin).hostname;
      // Permitir cualquier subdominio de Railway (*.railway.app, *.up.railway.app)
      if (hostname.endsWith('.railway.app') || hostname === 'railway.app') {
        return callback(null, true);
      }
      // Entorno de desarrollo local
      if (process.env.NODE_ENV !== 'production' && /^(localhost|127\.0\.0\.1)$/.test(hostname)) {
        return callback(null, true);
      }
    } catch {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
}));
app.disable('x-powered-by');
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

function createRateLimiter(maxRequests, windowMs) {
  const hits = new Map();
  return (req, res, next) => {
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || 'unknown';
    const now = Date.now();
    const record = hits.get(ip);
    if (!record || record.expiresAt <= now) {
      hits.set(ip, { count: 1, expiresAt: now + windowMs });
      if (hits.size > 5000) {
        for (const [k, v] of hits) {
          if (v.expiresAt <= now) hits.delete(k);
        }
      }
      return next();
    }
    record.count += 1;
    if (record.count > maxRequests) {
      return res.status(429).json({ error: 'Demasiadas solicitudes. Esperá un minuto e intentá nuevamente.' });
    }
    return next();
  };
}

const authLimiter = createRateLimiter(25, 60_000);
const chatLimiter = createRateLimiter(30, 60_000);

app.use(express.json({
  limit: '50mb',
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  },
}));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(authenticateToken);

// Health check endpoint para Railway y monitores
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth', authRouter);
app.use('/api/entities', entitiesRouter);
app.use('/api/functions', functionsRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/chat', chatLimiter, chatRouter);

// Static uploaded files
const uploadsPath = [
  path.resolve(__dirname, '../public/uploads'),
  path.join(process.cwd(), 'public', 'uploads'),
].find((p) => fs.existsSync(p)) || path.join(process.cwd(), 'public', 'uploads');

if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

// Static React build for Production
const candidateDistPaths = [
  path.resolve(__dirname, '../dist'),
  path.resolve(process.cwd(), 'dist'),
];
const distPath = candidateDistPaths.find((p) => fs.existsSync(p) && fs.existsSync(path.join(p, 'index.html')));

if (distPath) {
  console.log(`📁 Sirviendo bundle frontend desde: ${distPath}`);
  app.use(express.static(distPath, { maxAge: '1h', index: false }));

  // Fallback para React Router SPA
  app.get('*', (req, res, next) => {
    // Si la ruta pertenece a la API, uploads o es un archivo estático con extensión, delegar a 404
    if (
      req.path.startsWith('/api') ||
      req.path.startsWith('/uploads') ||
      req.path.startsWith('/assets') ||
      /\.[a-zA-Z0-9]+$/.test(req.path)
    ) {
      return next();
    }
    return res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  console.warn('⚠️ Carpeta "dist" no encontrada. El frontend no fue compilado o la ruta es incorrecta.');
  app.get('/', (req, res) => {
    res.status(503).send(`
      <!DOCTYPE html>
      <html lang="es">
        <head><meta charset="utf-8"><title>miContratos - Inicializando</title></head>
        <body style="font-family:system-ui,sans-serif;padding:40px;text-align:center;color:#1e293b;background:#f8fafc;">
          <h2>El frontend está compilando en Railway...</h2>
          <p>La carpeta <code>dist</code> no fue encontrada. Por favor revisá los logs de compilación en el dashboard de Railway.</p>
        </body>
      </html>
    `);
  });
}

// 404 Handler para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada', path: req.originalUrl });
});

// Middleware global de captura de errores
app.use((err, req, res, next) => {
  console.error('Error no controlado en Express:', err);
  const status = err.status || (err.name === 'SyntaxError' ? 400 : 500);
  res.status(status).json({ error: err.message || 'Error interno del servidor' });
});

import { initDb } from './db.js';

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`Servidor miContratos corriendo en http://0.0.0.0:${PORT}`);
  await initDb();
});

export default app;
