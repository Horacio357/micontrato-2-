import { PrismaClient } from '@prisma/client';
import { exec } from 'node:child_process';

export const prisma = new PrismaClient();

export function initDb() {
  if (process.env.DATABASE_URL) {
    exec('npx prisma db push --accept-data-loss --skip-generate', (err, stdout, stderr) => {
      if (err) {
        console.error('Error al sincronizar tablas PostgreSQL:', stderr || err.message);
      } else {
        console.log('Tablas PostgreSQL creadas/sincronizadas correctamente.');
      }
    });
  } else {
    console.warn('ADVERTENCIA: DATABASE_URL no configurada en Railway.');
  }
}
