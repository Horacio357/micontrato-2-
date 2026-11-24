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

export const LEGACY_LEGAL_STUBS = {
  tos: "Términos y condiciones de uso de micontratos.com de acuerdo a la legislación vigente de la República Argentina y normas de contratación electrónica del Código Civil y Comercial de la Nación.",
  privacy: "Política de privacidad de micontratos.com conforme a la Ley N° 25.326 de Protección de los Datos Personales de la República Argentina.",
  disclaimer: "Aviso legal y delimitación de responsabilidad de micontratos.com para instrumentos y modelos jurídicos emitidos.",
};

export const INITIAL_LEGAL_DOCS = [
  {
    document_type: "tos",
    title: "Términos y Condiciones de Uso",
    content: `### 1. Aceptación de los Términos
Al acceder, navegar o utilizar la plataforma micontratos.com ("la Plataforma"), usted ("el Usuario") declara que ha leído, comprendido y acepta en su totalidad los presentes Términos y Condiciones, así como nuestra Política de Privacidad. Si no está de acuerdo con alguna de las cláusulas, deberá abstenerse de utilizar el servicio.

### 2. Objeto y Naturaleza del Servicio
micontratos.com es una plataforma tecnológica SaaS diseñada para automatizar la redacción, personalización y suscripción electrónica de modelos contractuales conforme a la legislación vigente de la República Argentina (incluyendo el Código Civil y Comercial de la Nación, Ley de Locaciones y normas complementarias como el DNU 70/2023).

La Plataforma provee herramientas tecnológicas y plantillas estandarizadas. El uso de la Plataforma no constituye asesoramiento letrado personalizado ni patrocinio jurídico profesional. En caso de requerir dictamen legal sobre situaciones complejas o litigiosas, se recomienda la consulta con un abogado matriculado.

### 3. Validez Legal y Firma Electrónica
Los contratos celebrados a través de micontratos.com se formalizan mediante mecanismos de firma electrónica de acuerdo con el Artículo 288 del Código Civil y Comercial de la Nación y la Ley N° 25.506 de Firma Digital y Firma Electrónica.
La Plataforma registra e incorpora al documento generado:
- Identificación de las partes (nombre, apellido, DNI/CUIT y correo electrónico).
- Constancia de aceptación expresa de términos y declaraciones juradas.
- Trazabilidad técnica: dirección IP de origen, fecha y hora exacta (timestamp UTC) y hash criptográfico SHA-256 único e inalterable del instrumento.

### 4. Responsabilidad por los Datos Ingresados
El Usuario es el único y exclusivo responsable de la exactitud, veracidad y legalidad de toda la información suministrada en los formularios de confección del contrato. micontratos.com no verifica de oficio la titularidad de bienes ni la veracidad de los datos personales declarados por los firmantes.

### 5. Precios, Pagos y Facturación
El acceso a la descarga y suscripción de contratos definitivos está sujeto a los valores vigentes publicados en la Plataforma en Pesos Argentinos (ARS). Los pagos son procesados a través de pasarelas de pago seguras homologadas. Debido a que el servicio provee acceso inmediato a la descarga de documentación digital con valor legal, no se admiten reembolsos una vez generado y firmado el documento, salvo fallas técnicas atribuibles exclusivamente al sistema que imposibiliten la descarga.

### 6. Propiedad Intelectual
Todos los derechos de propiedad intelectual respecto del software, diseño, arquitectura, marcas, logotipos y plantillas de micontratos.com son propiedad exclusiva de sus respectivos titulares. Queda prohibida la reproducción, reventa o distribución no autorizada de la plataforma.

### 7. Ley Aplicable y Jurisdicción
Los presentes Términos y Condiciones se regirán e interpretarán de acuerdo con las leyes de la República Argentina. Ante cualquier controversia, las partes se someten a la competencia de los Tribunales Ordinarios competentes, renunciando a cualquier otro fuero que pudiera corresponderles.

Para consultas legales o administrativas, contáctenos en: admin@micontratos.com`,
  },
  {
    document_type: "privacy",
    title: "Política de Privacidad y Protección de Datos",
    content: `### 1. Compromiso de Confidencialidad
En micontratos.com la privacidad y protección de los datos personales de nuestros usuarios y firmantes constituyen un pilar fundamental. Tratamos toda la información con estricto apego a la Ley de Protección de los Datos Personales de la República Argentina (Ley N° 25.326), su Decreto Reglamentario N° 1558/2001 y demás normas concordantes.

### 2. Información que Recopilamos
Para la prestación adecuada del servicio y la formalización de contratos con validez legal, recopilamos:
- **Datos de identificación**: Nombres, apellidos, tipo y número de documento (DNI, CUIT/CUIL), domicilio legal y estado civil de los contratantes.
- **Datos de contacto**: Dirección de correo electrónico y teléfono de contacto.
- **Datos del contrato**: Direcciones de inmuebles, montos pactados, plazos de locación o prestación y cláusulas particulares seleccionadas.
- **Datos técnicos de auditoría de firma**: Dirección IP, user-agent del navegador web, coordenadas de geolocalización aproximada (cuando el usuario lo consiente) y trazado digitalizado de la firma manuscrita.

### 3. Finalidad del Tratamiento de Datos
Los datos personales recabados son utilizados única y exclusivamente para:
1. Confeccionar, generar y almacenar el instrumento contractual solicitado.
2. Permitir la firma electrónica de ambas partes (Locador/Locatario, Prestador/Cliente, etc.).
3. Enviar notificaciones indispensables relativas al estado del contrato y copias descargables en PDF/DOCX.
4. Generar el certificado de auditoría técnica que respalda la validez de la firma.

### 4. Prohibición de Comercialización a Terceros
micontratos.com jamás vende, cede, alquila ni comercializa las bases de datos de sus usuarios o el contenido de los contratos a terceras entidades con fines publicitarios ni de ninguna otra índole.

### 5. Medidas de Seguridad y Cifrado
Implementamos rigurosas medidas técnicas y organizativas para resguardar la integridad y confidencialidad de la información:
- Tráfico web 100% cifrado mediante protocolo HTTPS / TLS.
- Almacenamiento seguro en servidores con bases de datos relacionales protegidas y respaldos periódicos.
- Tokens criptográficos únicos e intransferibles para los enlaces de firma de cada parte contratante.

### 6. Ejercicio de Derechos ARCO (Acceso, Rectificación y Cancelación)
De conformidad con el Artículo 14 de la Ley 25.326, el titular de los datos personales tiene la facultad de ejercer el derecho de acceso a los mismos en forma gratuita a intervalos no inferiores a seis meses. Asimismo, podrá solicitar la rectificación, actualización o supresión de sus datos enviando un correo a **admin@micontratos.com**.

La AGENCIA DE ACCESO A LA INFORMACIÓN PÚBLICA, en su carácter de Órgano de Control de la Ley N° 25.326, tiene la atribución de atender las denuncias y reclamos que se interpongan con relación al incumplimiento de las normas sobre protección de datos personales.`,
  },
  {
    document_type: "disclaimer",
    title: "Aviso Legal",
    content: "micontratos.com provee modelos contractuales estandarizados y automatizados conformes a la legislación vigente de la República Argentina. El uso de la plataforma no sustituye el asesoramiento letrado particular en situaciones jurídicas complejas o litigiosas.",
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
      const isProductionStrict =
        process.env.NODE_ENV === 'production' && process.env.ENABLE_QA_PAYMENTS !== 'true';

      // 1. Administración segura en producción vs. semillas de QA en desarrollo
      if (isProductionStrict) {
        const configuredAdminEmail = (
          process.env.ADMIN_EMAIL ||
          (process.env.SUPER_ADMIN_EMAILS || '').split(',')[0] ||
          'admin@micontratos.com'
        ).trim().toLowerCase();

        if (process.env.ADMIN_INITIAL_PASSWORD && configuredAdminEmail) {
          const hashedPassword = await bcrypt.hash(process.env.ADMIN_INITIAL_PASSWORD, 10);
          const existing = await prisma.user.findUnique({ where: { email: configuredAdminEmail } });
          if (!existing) {
            await prisma.user.create({
              data: {
                email: configuredAdminEmail,
                name: 'Administrador miContratos',
                password: hashedPassword,
                role: 'admin',
                subscription_status: 'active',
              },
            });
            console.log(`✅ Administrador de producción creado: ${configuredAdminEmail}`);
          } else if (existing.role !== 'admin') {
            await prisma.user.update({
              where: { id: existing.id },
              data: { role: 'admin', password: hashedPassword },
            });
          } else if (configuredAdminEmail === 'admin@micontratos.com' && (await bcrypt.compare('admin123', existing.password))) {
            await prisma.user.update({
              where: { id: existing.id },
              data: { password: hashedPassword },
            });
            console.log('✅ Contraseña por defecto del administrador actualizada desde ADMIN_INITIAL_PASSWORD.');
          }
        }

        // Revocar membresía gratuita de demo QA si existiera de despliegues previos
        const existingDemo = await prisma.user.findUnique({ where: { email: 'demo@micontrato.com.ar' } });
        if (existingDemo && existingDemo.subscription_status === 'active') {
          await prisma.user.update({
            where: { id: existingDemo.id },
            data: { subscription_status: 'none' },
          });
        }
      } else {
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
      }

      // 2. Seed de plantillas base si la tabla está vacía
      const currentTemplates = await prisma.contractTemplate.findMany({ take: 1 });
      if (currentTemplates.length === 0) {
        for (const t of INITIAL_TEMPLATES) {
          await prisma.contractTemplate.create({ data: t });
        }
        console.log(`✅ ${INITIAL_TEMPLATES.length} plantillas base registradas en PostgreSQL.`);
      }

      // 3. Seed o actualización de textos placeholder en documentos legales
      const currentDocs = await prisma.legalDocument.findMany();
      if (currentDocs.length === 0) {
        for (const d of INITIAL_LEGAL_DOCS) {
          await prisma.legalDocument.create({ data: d });
        }
        console.log(`✅ ${INITIAL_LEGAL_DOCS.length} documentos legales base registrados en PostgreSQL.`);
      } else {
        for (const d of INITIAL_LEGAL_DOCS) {
          const existingDoc = currentDocs.find((c) => c.document_type === d.document_type);
          if (!existingDoc) {
            await prisma.legalDocument.create({ data: d });
          } else if (existingDoc.content?.trim() === LEGACY_LEGAL_STUBS[d.document_type]) {
            await prisma.legalDocument.update({
              where: { id: existingDoc.id },
              data: { title: d.title, content: d.content },
            });
          }
        }
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
