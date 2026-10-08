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
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://micontrato.com.ar',
  'https://www.micontrato.com.ar'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
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
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
}

import { initDb } from './db.js';

app.listen(PORT, () => {
  console.log(`Servidor miContrato corriendo en el puerto ${PORT}`);
  initDb();
});
