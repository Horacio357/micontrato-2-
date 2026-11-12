import { PrismaClient } from '@prisma/client';
import { exec } from 'node:child_process';
import bcrypt from 'bcryptjs';

export const INITIAL_TEMPLATES = [
  {
    name: "Locación de Inmueble (Vivienda)",
    slug: "locacion-vivienda",
    category: "inmobiliario",
    price: 4990,
    description: "Contrato de locación con destino habitacional conforme DNU 70/2023 y Código Civil y Comercial.",
    is_active: true,
  },
  {
    name: "Locación Comercial",
    slug: "locacion-comercial",
    category: "inmobiliario",
    price: 5990,
    description: "Alquiler de local u oficina para actividad comercial o profesional.",
    is_active: true,
  },
  {
    name: "Locación Temporaria Turística",
    slug: "locacion-temporaria-turistica",
    category: "inmobiliario",
    price: 5990,
    description: "Alquiler temporario con fines turísticos o de descanso por días o semanas.",
    is_active: true,
  },
  {
    name: "Locación de Servicios Profesionales",
    slug: "locacion-servicios-profesionales",
    category: "laboral",
    price: 4990,
    description: "Prestación de servicios profesionales independientes sin relación de dependencia.",
    is_active: true,
  },
  {
    name: "Convenio de Confidencialidad (NDA)",
    slug: "convenio-confidencialidad",
    category: "laboral",
    price: 4990,
    description: "Protección mutua o unilateral de información técnica, comercial y confidencial.",
    is_active: true,
  },
  {
    name: "Contrato de Mutuo Oneroso",
    slug: "mutuo-oneroso",
    category: "civil",
    price: 4990,
    description: "Préstamo de dinero en pesos o dólares con intereses compensatorios y punitorios.",
    is_active: true,
  },
];

export const INITIAL_LEGAL_DOCS = [
  {
    document_type: "tos",
    title: "Términos y Condiciones de Uso",
    content: "Términos y condiciones de uso de micontratos.com de acuerdo a la legislación vigente de la República Argentina y normas de contratación electrónica del Código Civil y Comercial de la Nación.",
  },
  {
    document_type: "privacy",
    title: "Política de Privacidad y Protección de Datos",
    content: "Política de privacidad de micontratos.com conforme a la Ley N° 25.326 de Protección de los Datos Personales de la República Argentina.",
  },
  {
    document_type: "disclaimer",
    title: "Aviso Legal",
    content: "Aviso legal y delimitación de responsabilidad de micontratos.com para instrumentos y modelos jurídicos emitidos.",
  },
];

const isPlaceholderDbUrl = (url = '') =>
  !url ||
  url.includes('placeholder:placeholder@localhost:5432') ||
  url.includes('postgres:password@localhost:5432');

const isDbConnectionError = (err) => {
  const msg = String(err?.message || '');
  const code = String(err?.code || '');
  return (
    code === 'P1001' ||
    code === 'P1002' ||
    code === 'P1003' ||
    msg.includes("Can't reach database server") ||
    msg.includes('ECONNREFUSED') ||
    msg.includes('ENOTFOUND') ||
    msg.includes('Environment variable not found: DATABASE_URL')
  );
};

let useMemoryFallback = isPlaceholderDbUrl(process.env.DATABASE_URL);

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
        id: 'local_user_sin_pago',
        email: 'sinpago@micontrato.com.ar',
        password: bcrypt.hashSync('123456', 10),
        name: 'Usuario Nuevo (Sin Pago)',
        role: 'user',
        subscription_status: 'none',
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
      },
      {
        id: 'local_superadmin_micontratos',
        email: 'admin@micontratos.com',
        password: bcrypt.hashSync('admin123', 10),
        name: 'Super Administrador miContratos',
        role: 'admin',
        subscription_status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      }
    ],
    generatedContract: [
      {
        id: 'demo_contract_1',
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
        id: 'demo_contract_2',
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
    contractTemplate: INITIAL_TEMPLATES.map((t, i) => ({
      id: `tmpl_${i + 1}`,
      ...t,
      created_at: new Date(),
      updated_at: new Date()
    })),
    contractSignature: [],
    contractFeedback: [],
    contractGenerationError: [],
    legalDocument: INITIAL_LEGAL_DOCS.map((doc, i) => ({
      id: `doc_${i + 1}`,
      ...doc,
      created_at: new Date(),
      updated_at: new Date()
    })),
    waitlistEmail: []
  };

  const matches = (item, where = {}) =>
    Object.entries(where).every(([k, v]) => {
      if (v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date)) {
        if ('in' in v) return Array.isArray(v.in) && v.in.includes(item[k]);
        if ('not' in v) return item[k] !== v.not;
        if ('contains' in v) return String(item[k] ?? '').toLowerCase().includes(String(v.contains).toLowerCase());
        if ('equals' in v) return item[k] === v.equals;
      }
      return item[k] === v;
    });

  const createModelHandler = (modelName) => ({
    findMany: async (args = {}) => {
      let items = [...(store[modelName] || [])];
      if (args.where) {
        items = items.filter((item) => matches(item, args.where));
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
      return items.find((item) => matches(item, args.where)) || null;
    },
    findFirst: async (args = {}) => {
      const items = store[modelName] || [];
      return items.find((item) => matches(item, args.where)) || null;
    },
    create: async ({ data }) => {
      const newItem = {
        created_at: new Date(),
        updated_at: new Date(),
        ...data,
        id: data.id || `mem_${modelName}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
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

const memoryStore = createMemoryStore();
let rawPrisma = null;
if (!useMemoryFallback) {
  try {
    rawPrisma = new PrismaClient();
  } catch (err) {
    console.warn('⚠️ No se pudo inicializar PrismaClient, activando almacenamiento en memoria:', err.message);
    useMemoryFallback = true;
  }
}

export const prisma = new Proxy({}, {
  get(_, modelName) {
    const memModel = memoryStore[modelName];
    if (useMemoryFallback || !rawPrisma || !(modelName in rawPrisma)) {
      return memModel;
    }
    const realModel = rawPrisma[modelName];
    if (typeof realModel !== 'object' || realModel === null) {
      return realModel;
    }
    return new Proxy(realModel, {
      get(target, method) {
        const orig = target[method];
        if (typeof orig !== 'function') return orig;
        return async (...args) => {
          if (useMemoryFallback) {
            return memModel[method](...args);
          }
          try {
            return await orig.apply(target, args);
          } catch (err) {
            if (isDbConnectionError(err)) {
              console.warn(`⚠️ PostgreSQL inaccesible (${modelName}.${String(method)}), cambiando automáticamente a almacenamiento en memoria.`);
              useMemoryFallback = true;
              return memModel[method](...args);
            }
            throw err;
          }
        };
      }
    });
  }
});

export async function initDb() {
  if (!useMemoryFallback && process.env.DATABASE_URL) {
    try {
      // 1. Seed super admin inicial si no existe
      const adminEmail = 'admin@micontratos.com';
      const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
      if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await prisma.user.create({
          data: {
            email: adminEmail,
            name: 'Super Administrador miContratos',
            password: hashedPassword,
            role: 'admin',
            subscription_status: 'active',
          },
        });
        console.log(`✅ Super Administrador inicial creado: ${adminEmail}`);
      }

      // Seed usuarios de prueba QA si no existen
      const existingDemo = await prisma.user.findUnique({ where: { email: 'demo@micontrato.com.ar' } });
      if (!existingDemo) {
        const demoPass = await bcrypt.hash('123456', 10);
        await prisma.user.create({
          data: {
            email: 'demo@micontrato.com.ar',
            name: 'Usuario Profesional Demo (QA)',
            password: demoPass,
            role: 'user',
            subscription_status: 'active',
          },
        });
        console.log('✅ Usuario demo QA con membresía creado: demo@micontrato.com.ar');
      }

      const existingSinPago = await prisma.user.findUnique({ where: { email: 'sinpago@micontrato.com.ar' } });
      if (!existingSinPago) {
        const sinPagoPass = await bcrypt.hash('123456', 10);
        await prisma.user.create({
          data: {
            email: 'sinpago@micontrato.com.ar',
            name: 'Usuario Nuevo Sin Pago (QA)',
            password: sinPagoPass,
            role: 'user',
            subscription_status: 'none',
          },
        });
        console.log('✅ Usuario sin pago QA creado: sinpago@micontrato.com.ar');
      }

      // 2. Seed de plantillas base si la tabla está vacía
      const currentTemplates = await prisma.contractTemplate.findMany({ take: 1 });
      if (currentTemplates.length === 0) {
        for (const t of INITIAL_TEMPLATES) {
          await prisma.contractTemplate.create({ data: t });
        }
        console.log(`✅ ${INITIAL_TEMPLATES.length} plantillas base registradas en PostgreSQL.`);
      }

      // 3. Seed de documentos legales base si la tabla está vacía
      const currentDocs = await prisma.legalDocument.findMany({ take: 1 });
      if (currentDocs.length === 0) {
        for (const d of INITIAL_LEGAL_DOCS) {
          await prisma.legalDocument.create({ data: d });
        }
        console.log(`✅ ${INITIAL_LEGAL_DOCS.length} documentos legales base registrados en PostgreSQL.`);
      }
      console.log('✅ Base de datos PostgreSQL conectada y sincronizada.');
    } catch (err) {
      console.error('Aviso al verificar datos iniciales en PostgreSQL:', err.message);
    }
  } else {
    console.log('🚀 MODO LOCAL ACTIVADO: Almacenamiento en memoria listo.');
    console.log('   Super Admin demo: admin@micontratos.com / admin123');
    console.log('   Usuario demo: demo@micontrato.com.ar / 123456');
  }
}
