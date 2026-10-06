import { PrismaClient } from '@prisma/client';
import { exec } from 'node:child_process';
import bcrypt from 'bcryptjs';

const isLocalMode = !process.env.DATABASE_URL;

function createMemoryStore() {
  const store = {
    user: [
      {
        id: 'local_user_1',
        email: 'demo@micontrato.com.ar',
        password: bcrypt.hashSync('123456', 10),
        name: 'Usuario Profesional Demo',
        role: 'user',
        subscription_status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'local_admin_1',
        email: 'admin@micontrato.com.ar',
        password: bcrypt.hashSync('admin123', 10),
        name: 'Administrador Demo',
        role: 'admin',
        subscription_status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      }
    ],
    generatedContract: [
      {
        id: 'local_demo_1',
        created_by_id: 'local_user_1',
        template_id: 'locacion-inmueble',
        template_name: 'Contrato de Locación de Inmueble Habitacional',
        category: 'inmobiliario',
        province: 'Córdoba',
        form_data: { locador_nombre: 'Dr. Alejandro Silva', locatario_nombre: 'Mariana López' },
        generated_text: 'CONTRATO DE LOCACIÓN DE INMUEBLE HABITACIONAL...',
        status: 'signed',
        signature_status: 'fully_signed',
        created_at: new Date(Date.now() - 86400000 * 2),
        updated_at: new Date()
      },
      {
        id: 'local_demo_2',
        created_by_id: 'local_user_1',
        template_id: 'servicios-profesionales',
        template_name: 'Contrato de Prestación de Servicios Profesionales',
        category: 'comercial',
        province: 'Buenos Aires',
        form_data: { cliente_nombre: 'Estudio Jurídico Central' },
        generated_text: 'CONTRATO DE PRESTACIÓN DE SERVICIOS PROFESIONALES...',
        status: 'draft',
        signature_status: 'pending_part_a',
        created_at: new Date(Date.now() - 86400000 * 5),
        updated_at: new Date()
      }
    ],
    contractTemplate: [],
    contractSignature: [],
    contractFeedback: [],
    contractGenerationError: [],
    legalDocument: [],
    waitlistEmail: []
  };

  const createModelHandler = (modelName) => ({
    findMany: async (args = {}) => {
      let items = [...(store[modelName] || [])];
      if (args.where) {
        items = items.filter((item) =>
          Object.entries(args.where).every(([k, v]) => item[k] === v)
        );
      }
      if (args.orderBy) {
        const [field, dir] = Object.entries(args.orderBy)[0] || [];
        if (field) {
          items.sort((a, b) => {
            if (a[field] < b[field]) return dir === 'desc' ? 1 : -1;
            if (a[field] > b[field]) return dir === 'desc' ? -1 : 1;
            return 0;
          });
        }
      }
      if (args.take) {
        items = items.slice(0, args.take);
      }
      return items;
    },
    findUnique: async (args = {}) => {
      const items = store[modelName] || [];
      return items.find((item) =>
        Object.entries(args.where || {}).every(([k, v]) => item[k] === v)
      ) || null;
    },
    create: async ({ data }) => {
      const newItem = {
        id: data.id || `local_${modelName}_${Date.now()}`,
        created_at: new Date(),
        updated_at: new Date(),
        ...data
      };
      if (!store[modelName]) store[modelName] = [];
      store[modelName].unshift(newItem);
      return newItem;
    },
    update: async ({ where, data }) => {
      const items = store[modelName] || [];
      const idx = items.findIndex((item) =>
        Object.entries(where || {}).every(([k, v]) => item[k] === v)
      );
      if (idx !== -1) {
        items[idx] = { ...items[idx], ...data, updated_at: new Date() };
        return items[idx];
      }
      return null;
    },
    delete: async ({ where }) => {
      const items = store[modelName] || [];
      const idx = items.findIndex((item) =>
        Object.entries(where || {}).every(([k, v]) => item[k] === v)
      );
      if (idx !== -1) {
        const [deleted] = items.splice(idx, 1);
        return deleted;
      }
      return null;
    }
  });

  return new Proxy({}, {
    get: (_, modelName) => createModelHandler(modelName)
  });
}

export const prisma = isLocalMode ? createMemoryStore() : new PrismaClient();

export function initDb() {
  if (process.env.DATABASE_URL) {
    exec('npx prisma db push --skip-generate', (err, stdout, stderr) => {
      if (err) {
        console.error('Error al sincronizar tablas PostgreSQL:', stderr || err.message);
      } else {
        console.log('Tablas PostgreSQL creadas/sincronizadas correctamente.');
      }
    });
  } else {
    console.log('🚀 MODO LOCAL ACTIVADO: Almacenamiento en memoria listo.');
    console.log('   Usuario demo: demo@micontrato.com.ar / 123456');
  }
}
