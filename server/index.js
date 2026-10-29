import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import 'dotenv/config';
import authRouter, { authenticateToken } from './routes/auth.js';
import entitiesRouter from './routes/entities.js';
import functionsRouter from './routes/functions.js';
import uploadRouter from './routes/upload.js';
import chatRouter from './routes/chat.js';

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
    // Permitir subdominios de Railway automáticamente
    if (/\.railway\.app$/.test(new URL(origin).hostname)) {
      return callback(null, true);
    }
    // Entorno de desarrollo local
    if (process.env.NODE_ENV !== 'production' && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(authenticateToken);

// API routes
app.use('/api/auth', authRouter);
app.use('/api/entities', entitiesRouter);
app.use('/api/functions', functionsRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/chat', chatRouter);

// Static uploaded files
const uploadsPath = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

// Static React build for Production
const distPath = path.join(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
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

app.listen(PORT, async () => {
  console.log(`Servidor miContratos corriendo en el puerto ${PORT}`);
  await initDb();
});

export default app;
