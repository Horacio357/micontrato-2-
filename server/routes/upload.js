import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';

const router = Router();
const uploadDir = path.join(process.cwd(), 'public', 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname) || '.txt';
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExts = ['.pdf', '.json', '.jpg', '.jpeg', '.png', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido'));
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB
});

router.post('/', upload.single('file'), (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  if (!req.file) {
    return res.status(400).json({ error: 'No se envió ningún archivo' });
  }
  const host = req.headers.host;
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  const file_url = `${protocol}://${host}/uploads/${req.file.filename}`;
  res.json({ file_url });
});

export default router;
