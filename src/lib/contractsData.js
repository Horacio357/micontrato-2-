import { calendarSteps } from '@/lib/contractDateFields';

export const CATEGORIES = [
  {
    id: "inmobiliario",
    name: "Inmobiliario",
    description: "Contratos de alquiler, compraventa y más",
    icon: "Building2",
    count: 5,
    color: "from-blue-600 to-blue-800",
  },
  {
    id: "laboral",
    name: "Laboral",
    description: "Relaciones de trabajo y servicios",
    icon: "Briefcase",
    count: 4,
    color: "from-emerald-600 to-emerald-800",
  },
  {
    id: "comercial",
    name: "Comercial",
    description: "Acuerdos comerciales y societarios",
    icon: "Handshake",
    count: 3,
    color: "from-amber-600 to-amber-800",
  },
  {
    id: "civil",
    name: "Civil",
    description: "Contratos civiles y personales",
    icon: "Scale",
    count: 4,
    color: "from-purple-600 to-purple-800",
  },
];

export const CONTRACTS = [
  // Inmobiliario
  { slug: "locacion-vivienda", name: "Locación de Inmueble", category: "inmobiliario", description: "Contrato de locación de inmueble con destino habitacional, con opción de garantes", whenToUse: "Cuando alquilás o das en alquiler una propiedad para vivir", time: 12, price: 4990, available: true },
  { slug: "locacion-comercial", name: "Locación Comercial", category: "inmobiliario", description: "Alquiler de local o espacio comercial", whenToUse: "Para alquilar un local, oficina o galpón", time: 8, price: 5990, available: true },
  { slug: "compraventa-inmueble", name: "Compraventa de Inmueble", category: "inmobiliario", description: "Boleto de compraventa de propiedad", whenToUse: "Cuando comprás o vendés un inmueble", time: 10, price: 6990, available: false },
  { slug: "comodato-inmueble", name: "Comodato de Inmueble", category: "inmobiliario", description: "Préstamo gratuito de un inmueble", whenToUse: "Cuando prestás un inmueble sin cobrar alquiler", time: 5, price: 3990, available: false },
  { slug: "reserva-inmueble", name: "Reserva de Inmueble", category: "inmobiliario", description: "Seña y reserva de propiedad", whenToUse: "Para señar un inmueble antes de la escritura", time: 4, price: 3490, available: false },
  { slug: "locacion-temporaria-turistica", name: "Locación Temporaria Turística", category: "inmobiliario", description: "Alquiler de inmueble amoblado con fines turísticos o de descanso", whenToUse: "Cuando alquilás o tomás en alquiler una propiedad por días o semanas para turismo o vacaciones", time: 8, price: 5990, available: true },
  // Laboral
  { slug: "contrato-trabajo", name: "Contrato de Trabajo", category: "laboral", description: "Relación de dependencia a plazo fijo o indeterminado", whenToUse: "Para formalizar una relación laboral", time: 8, price: 4990, available: false },
  { slug: "locacion-servicios-profesionales", name: "Locación de Servicios Profesionales", category: "laboral", description: "Prestación de servicios profesionales independientes", whenToUse: "Cuando contratás un profesional independiente sin relación de dependencia", time: 6, price: 4990, available: true },
  { slug: "convenio-confidencialidad", name: "Convenio de Confidencialidad (NDA)", category: "laboral", description: "Protección de información sensible entre partes", whenToUse: "Para proteger secretos comerciales o información reservada en una negociación", time: 5, price: 4990, available: true },
  { slug: "no-competencia", name: "Acuerdo de No Competencia", category: "laboral", description: "Restricción de actividades competitivas", whenToUse: "Para evitar que un ex empleado compita directamente", time: 5, price: 3990, available: false },
  // Comercial
  { slug: "sociedad-hecho", name: "Sociedad de Hecho", category: "comercial", description: "Acuerdo entre socios sin constitución formal", whenToUse: "Para armar un negocio entre dos o más personas", time: 8, price: 5990, available: false },
  { slug: "cesion-derechos", name: "Cesión de Derechos", category: "comercial", description: "Transferencia de derechos sobre un bien o crédito", whenToUse: "Para ceder derechos a un tercero", time: 6, price: 4990, available: false },
  { slug: "distribucion", name: "Contrato de Distribución", category: "comercial", description: "Distribución exclusiva o no exclusiva", whenToUse: "Para distribuir productos de terceros", time: 7, price: 5490, available: false },
  // Civil
  { slug: "mutuo-oneroso", name: "Contrato de Mutuo Oneroso", category: "civil", description: "Préstamo de dinero con intereses entre partes", whenToUse: "Cuando prestás o recibís dinero con intereses y querés documentarlo legalmente", time: 10, price: 4990, available: true },
  { slug: "prestamo-dinero", name: "Préstamo de Dinero", category: "civil", description: "Mutuo con o sin intereses", whenToUse: "Cuando prestás o pedís dinero prestado", time: 5, price: 3990, available: false },
  { slug: "donacion", name: "Contrato de Donación", category: "civil", description: "Donación de bienes muebles", whenToUse: "Para donar bienes a otra persona", time: 4, price: 3490, available: false },
  { slug: "permuta", name: "Contrato de Permuta", category: "civil", description: "Intercambio de bienes entre partes", whenToUse: "Para intercambiar bienes sin dinero de por medio", time: 5, price: 3990, available: false },
];

export const PROVINCES = [
  { slug: "caba", name: "CABA", available: true },
  { slug: "buenos-aires", name: "Buenos Aires", available: true },
  { slug: "cordoba", name: "Córdoba", available: true },
  { slug: "santa-fe", name: "Santa Fe", available: true },
  { slug: "mendoza", name: "Mendoza", available: true },
  { slug: "tucuman", name: "Tucumán", available: true },
  { slug: "entre-rios", name: "Entre Ríos", available: true },
  { slug: "salta", name: "Salta", available: true },
  { slug: "misiones", name: "Misiones", available: true },
  { slug: "chaco", name: "Chaco", available: true },
  { slug: "corrientes", name: "Corrientes", available: true },
  { slug: "santiago-del-estero", name: "Santiago del Estero", available: true },
  { slug: "san-juan", name: "San Juan", available: true },
  { slug: "jujuy", name: "Jujuy", available: true },
  { slug: "rio-negro", name: "Río Negro", available: true },
  { slug: "neuquen", name: "Neuquén", available: true },
  { slug: "formosa", name: "Formosa", available: true },
  { slug: "chubut", name: "Chubut", available: true },
  { slug: "san-luis", name: "San Luis", available: true },
  { slug: "catamarca", name: "Catamarca", available: true },
  { slug: "la-rioja", name: "La Rioja", available: true },
  { slug: "la-pampa", name: "La Pampa", available: true },
  { slug: "santa-cruz", name: "Santa Cruz", available: true },
  { slug: "tierra-del-fuego", name: "Tierra del Fuego", available: true },
];

export const PROVINCE_OPTIONS = PROVINCES.map(({ name }) => name);

export const WIZARD_STEPS = {
  "locacion-temporaria-turistica": [
    {
      title: "Lugar y Fecha del Contrato",
      fields: [
        { name: "lugar_celebracion", label: "Ciudad de celebración", type: "text", required: true, placeholder: "Rosario" },
        { name: "fecha_celebracion", label: "Fecha de celebración", type: "date", required: true },
      ],
    },
    {
      title: "Datos del Locador",
      fields: [
        { name: "locador_nombre_completo", label: "Nombre completo", type: "text", required: true, placeholder: "Juan Pérez" },
        { name: "locador_dni", label: "DNI", type: "text", required: true, placeholder: "12.345.678" },
        { name: "locador_cuit_cuil", label: "CUIT/CUIL", type: "text", required: true, placeholder: "20-12345678-5" },
        { name: "locador_calle", label: "Calle (domicilio)", type: "text", required: true, placeholder: "Av. San Martín" },
        { name: "locador_altura", label: "Altura", type: "number", required: true, placeholder: "1234" },
        { name: "locador_ciudad", label: "Ciudad", type: "text", required: true, placeholder: "Rosario" },
        { name: "locador_provincia", label: "Provincia", type: "text", required: true, placeholder: "Santa Fe" },
        { name: "locador_correo_electronico", label: "Correo electrónico", type: "text", required: true, placeholder: "juan@mail.com" },
        { name: "locador_numero_telefono", label: "Teléfono / WhatsApp", type: "text", required: true, placeholder: "3415001234" },
      ],
    },
    {
      title: "Datos del Locatario",
      fields: [
        { name: "locatario_nombre_completo", label: "Nombre completo", type: "text", required: true, placeholder: "Ana López" },
        { name: "locatario_dni_pasaporte", label: "DNI / Pasaporte", type: "text", required: true, placeholder: "33.444.555" },
        { name: "locatario_cuit_cuil", label: "CUIT/CUIL", type: "text", required: true, placeholder: "27-33444555-4" },
        { name: "locatario_calle", label: "Calle (domicilio)", type: "text", required: true, placeholder: "Corrientes" },
        { name: "locatario_altura", label: "Altura", type: "number", required: true, placeholder: "500" },
        { name: "locatario_ciudad", label: "Ciudad", type: "text", required: true, placeholder: "CABA" },
        { name: "locatario_provincia", label: "Provincia", type: "text", required: true, placeholder: "Buenos Aires" },
        { name: "locatario_correo_electronico", label: "Correo electrónico", type: "text", required: true, placeholder: "ana@mail.com" },
        { name: "locatario_numero_telefono", label: "Teléfono / WhatsApp", type: "text", required: true, placeholder: "1150001234" },
      ],
    },
    {
      title: "Datos del Inmueble",
      fields: [
        { name: "inmueble_calle", label: "Calle del inmueble", type: "text", required: true, placeholder: "Las Flores" },
        { name: "inmueble_piso_depto", label: "Piso/Depto (opcional)", type: "text", required: false, placeholder: "3° B" },
        { name: "inmueble_ciudad", label: "Ciudad/Localidad del inmueble", type: "text", required: true, placeholder: "Mar del Plata" },
        { name: "inmueble_provincia", label: "Provincia del inmueble", type: "text", required: true, placeholder: "Buenos Aires" },
        { name: "numero_registro_habilitacion", label: "N° de registro/habilitación turística", type: "text", required: true, placeholder: "00123" },
      ],
    },
    {
      title: "Estadía",
      fields: [
        { name: "fecha_ingreso", label: "Fecha de ingreso (check-in)", type: "date", required: true },
        { name: "hora_ingreso", label: "Hora de ingreso", type: "text", required: true, placeholder: "14:00" },
        { name: "fecha_egreso", label: "Fecha de egreso (check-out)", type: "date", required: true },
        { name: "hora_egreso", label: "Hora de egreso", type: "text", required: true, placeholder: "10:00" },
        { name: "cantidad_dias_calculados", label: "Cantidad de días", type: "number", required: true, placeholder: "5" },
        { name: "numero_maximo_huespedes", label: "Cantidad máxima de huéspedes", type: "number", required: true, placeholder: "4" },
        { name: "limite_luz_kw", label: "Límite de KW incluidos (si cobra excedente)", type: "number", required: false, placeholder: "300" },
      ],
    },
    {
      title: "Precio y Sanciones",
      fields: [
        { name: "precio_total_numeros", label: "Precio total en números", type: "number", required: true, placeholder: "50000 (se convierte a letras automáticamente)" },
        { name: "moneda", label: "Moneda", type: "select", required: true, options: ["pesos argentinos", "dólares estadounidenses"] },
        { name: "fecha_pago_sena", label: "Fecha de pago de la seña", type: "date", required: true },
        { name: "porcentaje_sena", label: "Porcentaje de seña (%)", type: "number", required: true, placeholder: "40" },
        { name: "porcentaje_restante_calculado", label: "Porcentaje restante (%)", type: "number", required: true, placeholder: "60" },
        { name: "monto_deposito_numeros", label: "Depósito en garantía en números", type: "number", required: true, placeholder: "10000 (se convierte a letras automáticamente)" },
        { name: "multa_diaria_numeros", label: "Multa diaria por demora en números", type: "number", required: true, placeholder: "100 (se convierte a letras automáticamente)" },
      ],
    },
    {
      title: "Jurisdicción y Cierre",
      fields: [
        { name: "ciudad_partido", label: "Ciudad/Partido de jurisdicción (tribunales)", type: "text", required: true, placeholder: "San Miguel de Tucumán" },
        { name: "cantidad_ejemplares", label: "Cantidad de ejemplares", type: "number", required: true, placeholder: "2" },
      ],
    },
  ],
  "locacion-comercial": [
    {
      title: "Lugar y Fecha del Contrato",
      fields: [
        { name: "lugar_celebracion", label: "Ciudad de celebración", type: "text", required: true, placeholder: "San Miguel de Tucumán" },
        { name: "fecha_celebracion", label: "Fecha de celebración", type: "date", required: true },
      ],
    },
    {
      title: "Datos del Locador",
      fields: [
        { name: "locador_nombre_completo", label: "Nombre completo", type: "text", required: true, placeholder: "Juan Pérez" },
        { name: "locador_dni_cuit", label: "DNI/CUIT", type: "text", required: true, placeholder: "20-12345678-5" },
        { name: "locador_domicilio_calle", label: "Calle (domicilio)", type: "text", required: true, placeholder: "San Martín" },
        { name: "locador_domicilio_altura", label: "Altura", type: "number", required: true, placeholder: "1234" },
      ],
    },
    {
      title: "Datos del Locatario",
      fields: [
        { name: "locatario_nombre_completo", label: "Nombre completo", type: "text", required: true, placeholder: "Ana López" },
        { name: "locatario_dni_cuit", label: "DNI/CUIT", type: "text", required: true, placeholder: "27-33444555-4" },
        { name: "locatario_domicilio_calle", label: "Calle (domicilio)", type: "text", required: true, placeholder: "Corrientes" },
        { name: "locatario_domicilio_altura", label: "Altura", type: "number", required: true, placeholder: "500" },
      ],
    },
    {
      title: "Datos del Inmueble",
      fields: [
        { name: "inmueble_calle", label: "Calle", type: "text", required: true, placeholder: "Av. Alem" },
        { name: "inmueble_altura", label: "Altura", type: "number", required: true, placeholder: "500" },
        { name: "inmueble_destino_comercial", label: "Destino comercial / rubro", type: "text", required: true, placeholder: "Restaurante, farmacia, indumentaria..." },
      ],
    },
    {
      title: "Plazo",
      fields: [
        { name: "plazo_meses", label: "Plazo en meses", type: "number", required: true, placeholder: "36" },
        { name: "plazo_anos_calculados", label: "Plazo en años", type: "number", required: true, placeholder: "3" },
        { name: "fecha_inicio", label: "Fecha de inicio", type: "date", required: true },
        { name: "fecha_fin", label: "Fecha de finalización", type: "date", required: true },
      ],
    },
    {
      title: "Precio y Actualización",
      fields: [
        { name: "canon_inicial_numeros", label: "Canon mensual inicial en números", type: "number", required: true, placeholder: "150000 (se convierte a letras automáticamente)" },
        { name: "dia_pago_limite", label: "Día límite de pago", type: "number", required: true, placeholder: "10" },
        { name: "periodo_actualizacion", label: "Periodicidad de actualización", type: "select", required: true, options: ["mensual", "bimestral", "trimestral", "cuatrimestral", "semestral", "anual"] },
        { name: "indice_actualizacion", label: "Índice de actualización", type: "select", required: true, options: ["IPC", "ICL", "CAC", "CER"] },
        { name: "interes_mora_mensual", label: "Interés por mora mensual (%)", type: "number", required: true, placeholder: "5" },
        { name: "monto_deposito_numeros", label: "Depósito en garantía en números", type: "number", required: true, placeholder: "150000 (se convierte a letras automáticamente)" },
      ],
    },
    {
      title: "Garantías",
      fields: [
        { name: "garante_1_nombre", label: "Garante 1 - Nombre completo", type: "text", required: false, placeholder: "Carlos Gómez" },
        { name: "garante_1_dni", label: "Garante 1 - DNI", type: "text", required: false, placeholder: "28.111.222" },
        { name: "garante_2_nombre", label: "Garante 2 - Nombre completo", type: "text", required: false, placeholder: "María Rodríguez" },
        { name: "garante_2_dni", label: "Garante 2 - DNI", type: "text", required: false, placeholder: "30.222.333" },
        { name: "garante_3_nombre", label: "Garante 3 - Nombre completo", type: "text", required: false, placeholder: "Pedro Fernández" },
        { name: "garante_3_dni", label: "Garante 3 - DNI", type: "text", required: false, placeholder: "31.555.666" },
      ],
    },
    {
      title: "Cierre y Firma",
      fields: [
        { name: "cantidad_ejemplares", label: "Cantidad de ejemplares", type: "number", required: true, placeholder: "2" },
      ],
    },
  ],
  "mutuo-oneroso": [
    {
      title: "Lugar y Fecha del Contrato",
      fields: [
        { name: "lugar_celebracion", label: "Ciudad de celebración", type: "text", required: true, placeholder: "San Miguel de Tucumán" },
        { name: "provincia_celebracion", label: "Provincia de celebración", type: "text", required: true, placeholder: "Tucumán" },
        { name: "fecha_celebracion", label: "Fecha de celebración", type: "date", required: true },
      ],
    },
    {
      title: "Datos del Mutuante (quien presta)",
      fields: [
        { name: "mutuante_nombre_completo", label: "Nombre completo", type: "text", required: true, placeholder: "Juan Carlos Pérez" },
        { name: "mutuante_dni", label: "DNI", type: "text", required: true, placeholder: "12.345.678" },
        { name: "mutuante_cuit_cuil", label: "CUIT/CUIL", type: "text", required: true, placeholder: "20-12345678-5" },
        { name: "mutuante_estado_civil", label: "Estado civil", type: "select", required: true, options: ["Soltero/a", "Casado/a", "Divorciado/a", "Viudo/a"] },
        { name: "mutuante_calle", label: "Calle (domicilio)", type: "text", required: true, placeholder: "Av. San Martín" },
        { name: "mutuante_altura", label: "Altura", type: "number", required: true, placeholder: "1234" },
        { name: "mutuante_localidad", label: "Localidad", type: "text", required: true, placeholder: "San Miguel de Tucumán" },
        { name: "mutuante_provincia", label: "Provincia", type: "text", required: true, placeholder: "Tucumán" },
        { name: "mutuante_correo_electronico", label: "Correo electrónico", type: "text", required: true, placeholder: "juan@mail.com" },
      ],
    },
    {
      title: "Datos del Mutuario (quien recibe)",
      fields: [
        { name: "mutuario_nombre_completo", label: "Nombre completo", type: "text", required: true, placeholder: "Ana María López" },
        { name: "mutuario_dni", label: "DNI", type: "text", required: true, placeholder: "33.444.555" },
        { name: "mutuario_cuit_cuil", label: "CUIT/CUIL", type: "text", required: true, placeholder: "27-33444555-4" },
        { name: "mutuario_estado_civil", label: "Estado civil", type: "select", required: true, options: ["Soltero/a", "Casado/a", "Divorciado/a", "Viudo/a"] },
        { name: "mutuario_calle", label: "Calle (domicilio)", type: "text", required: true, placeholder: "Corrientes" },
        { name: "mutuario_altura", label: "Altura", type: "number", required: true, placeholder: "500" },
        { name: "mutuario_localidad", label: "Localidad", type: "text", required: true, placeholder: "CABA" },
        { name: "mutuario_provincia", label: "Provincia", type: "text", required: true, placeholder: "Buenos Aires" },
        { name: "mutuario_correo_electronico", label: "Correo electrónico", type: "text", required: true, placeholder: "ana@mail.com" },
      ],
    },
    {
      title: "Capital y Forma de Entrega",
      fields: [
        { name: "moneda", label: "Moneda", type: "select", required: true, options: ["Pesos Argentinos", "USD"] },
        { name: "monto_capital_numeros", label: "Monto del préstamo en números", type: "text", formatAsCurrency: true, required: true, placeholder: "1000000 (se convierte a letras automáticamente)" },
        { name: "metodo_entrega", label: "Forma de entrega del capital", type: "select", required: true, options: ["efectivo", "transferencia bancaria"] },
        { name: "cbu_cvu", label: "CBU/CVU (si es transferencia)", type: "text", required: false, placeholder: "0000003100000000000000", visibleWhen: { field: "metodo_entrega", value: "transferencia bancaria" }, requiredWhen: { field: "metodo_entrega", value: "transferencia bancaria" } },
      ],
    },
    {
      title: "Plazo y Devolución",
      fields: [
        { name: "plazo_meses", label: "Plazo de devolución (meses)", type: "number", required: true, placeholder: "12" },
        { name: "fecha_vencimiento", label: "Fecha de vencimiento", type: "date", required: true },
        { name: "cantidad_cuotas", label: "Cantidad de cuotas", type: "number", required: true, placeholder: "12" },
        { name: "monto_cuota_numeros", label: "Monto de cada cuota en números", type: "number", required: true, placeholder: "100000 (se convierte a letras automáticamente)" },
      ],
    },
    {
      title: "Intereses",
      fields: [
        { name: "interes_compensatorio_mensual_numeros", label: "Interés compensatorio mensual (%)", type: "number", required: true, placeholder: "3" },
        { name: "tna_numeros", label: "Tasa Nominal Anual - TNA (%)", type: "number", required: true, placeholder: "36" },
        { name: "interes_moratorio_mensual_numeros", label: "Interés moratorio/punitorio mensual (%)", type: "number", required: true, placeholder: "5" },
      ],
    },
    {
      title: "Fiador",
      fields: [
        { name: "incluir_fiador", label: "Incluir fiador", type: "select", required: true, options: ["No", "Sí"] },
        { name: "garantes_g1_nombre_opcional", label: "Fiador - Nombre completo", type: "text", required: false, placeholder: "Carlos Gómez", visibleWhen: { field: "incluir_fiador", value: "Sí" } },
        { name: "garantes_g1_nacionalidad_opcional", label: "Fiador - Nacionalidad", type: "text", required: false, placeholder: "argentina", visibleWhen: { field: "incluir_fiador", value: "Sí" } },
        { name: "garantes_g1_estado_civil_opcional", label: "Fiador - Estado civil", type: "select", required: false, options: ["Soltero/a", "Casado/a", "Divorciado/a", "Viudo/a"], visibleWhen: { field: "incluir_fiador", value: "Sí" } },
        { name: "garantes_g1_dni_opcional", label: "Fiador - DNI", type: "text", required: false, placeholder: "28.111.222", visibleWhen: { field: "incluir_fiador", value: "Sí" } },
        { name: "garantes_g1_cuit_cuil_opcional", label: "Fiador - CUIT/CUIL", type: "text", required: false, placeholder: "20-28111222-3", visibleWhen: { field: "incluir_fiador", value: "Sí" } },
        { name: "garantes_g1_domicilio_calle_opcional", label: "Fiador - Calle (domicilio)", type: "text", required: false, placeholder: "Belgrano", visibleWhen: { field: "incluir_fiador", value: "Sí" } },
        { name: "garantes_g1_altura_opcional", label: "Fiador - Altura", type: "number", required: false, placeholder: "800", visibleWhen: { field: "incluir_fiador", value: "Sí" } },
        { name: "garantes_g1_localidad_opcional", label: "Fiador - Localidad", type: "text", required: false, placeholder: "San Miguel de Tucumán", visibleWhen: { field: "incluir_fiador", value: "Sí" } },
        { name: "garantes_g1_provincia_opcional", label: "Fiador - Provincia", type: "select", required: false, options: PROVINCE_OPTIONS, visibleWhen: { field: "incluir_fiador", value: "Sí" } },
      ],
    },
    {
      title: "Certificación de Firmas",
      fields: [
        { name: "certificar_firmas_escribano", label: "Certificación de firma por escribano", type: "select", required: true, options: ["No", "Sí, voy a certificar firmas"] },
      ],
    },
  ],
  "locacion-vivienda": [
    {
      title: "Datos del Locador",
      fields: [
        { name: "locador_nombre_completo", label: "Nombre completo", type: "text", required: true, placeholder: "Juan Carlos Pérez" },
        { name: "locador_dni", label: "DNI", type: "text", required: true, placeholder: "12.345.678" },
        { name: "locador_cuit_cuil", label: "CUIL/CUIT", type: "text", required: true, placeholder: "20-12345678-5" },
        { name: "locador_correo_electronico", label: "Correo electrónico", type: "text", required: true, placeholder: "juan@email.com" },
        { name: "locador_fecha_nacimiento", label: "Fecha de nacimiento", type: "date", required: true },
        { name: "locador_nacionalidad", label: "Nacionalidad", type: "text", required: true, placeholder: "argentina" },
        { name: "locador_estado_civil", label: "Estado civil", type: "select", required: true, options: ["Soltero/a", "Casado/a", "Divorciado/a", "Viudo/a"] },
        { name: "locador_calle", label: "Calle", type: "text", required: true, placeholder: "Av. San Martín" },
        { name: "locador_numeracion", label: "Número", type: "text", required: true, placeholder: "1234" },
        { name: "locador_ciudad", label: "Ciudad", type: "text", required: true, placeholder: "San Miguel de Tucumán" },
        { name: "locador_departamento_partido", label: "Departamento / Partido", type: "text", required: true, placeholder: "Capital" },
        { name: "locador_provincia", label: "Provincia", type: "text", required: true, placeholder: "Tucumán" },
      ],
    },
    {
      title: "Datos del Locatario",
      fields: [
        { name: "locatario_nombre_completo", label: "Nombre completo", type: "text", required: true, placeholder: "Ana María López" },
        { name: "locatario_dni", label: "DNI", type: "text", required: true, placeholder: "33.444.555" },
        { name: "locatario_cuit_cuil", label: "CUIL/CUIT", type: "text", required: true, placeholder: "27-33444555-4" },
        { name: "locatario_correo_electronico", label: "Correo electrónico", type: "text", required: true, placeholder: "ana@email.com" },
        { name: "locatario_fecha_nacimiento", label: "Fecha de nacimiento", type: "date", required: true },
        { name: "locatario_nacionalidad", label: "Nacionalidad", type: "text", required: true, placeholder: "argentina" },
        { name: "locatario_estado_civil", label: "Estado civil", type: "select", required: true, options: ["Soltero/a", "Casado/a", "Divorciado/a", "Viudo/a"] },
        { name: "locatario_calle", label: "Calle", type: "text", required: true, placeholder: "Corrientes" },
        { name: "locatario_numeracion", label: "Número", type: "text", required: true, placeholder: "500" },
        { name: "locatario_ciudad", label: "Ciudad", type: "text", required: true, placeholder: "CABA" },
        { name: "locatario_departamento_partido", label: "Departamento / Partido", type: "text", required: true, placeholder: "Buenos Aires" },
        { name: "locatario_provincia", label: "Provincia", type: "text", required: true, placeholder: "Buenos Aires" },
      ],
    },
    {
      title: "Datos del Inmueble",
      fields: [
        { name: "inmueble_calle", label: "Calle", type: "text", required: true, placeholder: "Las Flores" },
        { name: "inmueble_numeracion", label: "Numeración", type: "text", required: true, placeholder: "200" },
        { name: "inmueble_piso_departamento", label: "Piso / Departamento", type: "text", required: false, placeholder: "3° B" },
        { name: "inmueble_nomenclatura_catastral", label: "Nomenclatura catastral", type: "text", required: true, placeholder: "026-04-00-021" },
        { name: "inmueble_partida_inmobiliaria", label: "Partida inmobiliaria", type: "text", required: true, placeholder: "12345-6" },
        { name: "inmueble_ciudad", label: "Ciudad", type: "text", required: true, placeholder: "San Miguel de Tucumán" },
        { name: "inmueble_departamento_partido", label: "Departamento / Partido", type: "text", required: true, placeholder: "Capital" },
        { name: "inmueble_provincia", label: "Provincia", type: "text", required: true, placeholder: "Tucumán" },
        { name: "inmueble_cantidad_habitaciones", label: "Cantidad de habitaciones", type: "number", required: true, placeholder: "6" },
        { name: "inmueble_cantidad_dormitorios", label: "Cantidad de dormitorios", type: "number", required: true, placeholder: "2" },
        { name: "inmueble_cantidad_banos", label: "Cantidad de baños", type: "number", required: true, placeholder: "1" },
        { name: "inmueble_living", label: "Living / Comedor", type: "text", required: true, placeholder: "un (1) living-comedor" },
        { name: "inmueble_cocina", label: "Cocina", type: "text", required: true, placeholder: "una (1) cocina" },
        { name: "inmueble_espacio_libre", label: "Espacio libre / patio / balcón (opcional)", type: "text", required: false, placeholder: "un (1) patio trasero" },
      ],
    },
    {
      title: "Plazo del Contrato",
      fields: [
        { name: "plazo_cantidad_meses", label: "Plazo en meses", type: "number", required: true, placeholder: "36" },
        { name: "plazo_cantidad_anos", label: "Plazo en años", type: "number", required: true, placeholder: "3" },
        { name: "plazo_inicio_fecha", label: "Fecha de inicio", type: "date", required: true },
        { name: "plazo_fin_fecha", label: "Fecha de finalización", type: "date", required: true },
      ],
    },
    {
      title: "Precio y Actualización",
      fields: [
        { name: "condiciones_monto_mensual", label: "Precio mensual en números", type: "number", required: true, placeholder: "150000 (se convierte a letras automáticamente)" },
        { name: "condiciones_periodo_primer_pago", label: "Período inicial del precio", type: "select", required: true, options: ["bimestre", "trimestre", "cuatrimestre", "semestre", "año"] },
        { name: "condiciones_periodo_incremento", label: "Periodicidad del incremento", type: "select", required: true, options: ["bimestral", "trimestral", "cuatrimestral", "semestral", "anual"] },
        { name: "condiciones_indice_actualizacion", label: "Índice de actualización", type: "text", required: true, placeholder: "ICL (Índice Casa de la Locación) / IPC / otro" },
        { name: "condiciones_interes_mensual", label: "Interés por mora mensual (%)", type: "number", required: true, placeholder: "5" },
      ],
    },
    {
      title: "Servicios y Depósito",
      fields: [
        { name: "condiciones_servicios_a_cargo", label: "Servicios a cargo del locatario", type: "text", required: true, placeholder: "luz, gas, agua, internet, expensas ordinarias" },
        { name: "condiciones_monto_deposito", label: "Depósito en garantía en números", type: "number", required: true, placeholder: "150000 (se convierte a letras automáticamente)" },
      ],
    },
    {
      title: "Garante 1",
      fields: [
        { name: "garante_1_nombre", label: "Garante 1 - Nombre completo", type: "text", required: false, placeholder: "Carlos Alberto Gómez" },
        { name: "garante_1_dni", label: "Garante 1 - DNI", type: "text", required: false, placeholder: "28.111.222" },
        { name: "garante_1_cuit_cuil", label: "Garante 1 - CUIL/CUIT", type: "text", required: false, placeholder: "20-28111222-3" },
        { name: "garante_1_nacionalidad", label: "Garante 1 - Nacionalidad", type: "text", required: false, placeholder: "argentina" },
        { name: "garante_1_estado_civil", label: "Garante 1 - Estado civil", type: "select", required: false, options: ["Soltero/a", "Casado/a", "Divorciado/a", "Viudo/a"] },
        { name: "garante_1_calle", label: "Garante 1 - Calle", type: "text", required: false, placeholder: "Belgrano" },
        { name: "garante_1_numeracion", label: "Garante 1 - Número", type: "text", required: false, placeholder: "800" },
        { name: "garante_1_barrio", label: "Garante 1 - Barrio", type: "text", required: false, placeholder: "Centro" },
        { name: "garante_1_ciudad", label: "Garante 1 - Ciudad", type: "text", required: false, placeholder: "San Miguel de Tucumán" },
        { name: "garante_1_departamento", label: "Garante 1 - Departamento", type: "text", required: false, placeholder: "Capital" },
        { name: "garante_1_provincia", label: "Garante 1 - Provincia", type: "text", required: false, placeholder: "Tucumán" },
        { name: "garante_1_cp", label: "Garante 1 - Código postal", type: "text", required: false, placeholder: "4000" },
        { name: "garante_1_celular", label: "Garante 1 - Celular", type: "text", required: false, placeholder: "3815001234" },
        { name: "garante_1_email", label: "Garante 1 - Email", type: "text", required: false, placeholder: "garante1@email.com" },
      ],
    },
    {
      title: "Garante 2 (opcional)",
      fields: [
        { name: "garante_2_nombre", label: "Garante 2 - Nombre completo", type: "text", required: false, placeholder: "María Fernanda Rodríguez" },
        { name: "garante_2_dni", label: "Garante 2 - DNI", type: "text", required: false, placeholder: "30.222.333" },
        { name: "garante_2_cuit_cuil", label: "Garante 2 - CUIL/CUIT", type: "text", required: false, placeholder: "27-30222333-4" },
        { name: "garante_2_nacionalidad", label: "Garante 2 - Nacionalidad", type: "text", required: false, placeholder: "argentina" },
        { name: "garante_2_estado_civil", label: "Garante 2 - Estado civil", type: "select", required: false, options: ["Soltero/a", "Casado/a", "Divorciado/a", "Viudo/a"] },
        { name: "garante_2_calle", label: "Garante 2 - Calle", type: "text", required: false, placeholder: "Laprida" },
        { name: "garante_2_numeracion", label: "Garante 2 - Número", type: "text", required: false, placeholder: "450" },
        { name: "garante_2_barrio", label: "Garante 2 - Barrio", type: "text", required: false, placeholder: "Sur" },
        { name: "garante_2_ciudad", label: "Garante 2 - Ciudad", type: "text", required: false, placeholder: "San Miguel de Tucumán" },
        { name: "garante_2_departamento", label: "Garante 2 - Departamento", type: "text", required: false, placeholder: "Capital" },
        { name: "garante_2_provincia", label: "Garante 2 - Provincia", type: "text", required: false, placeholder: "Tucumán" },
        { name: "garante_2_cp", label: "Garante 2 - Código postal", type: "text", required: false, placeholder: "4000" },
        { name: "garante_2_celular", label: "Garante 2 - Celular", type: "text", required: false, placeholder: "3815005678" },
        { name: "garante_2_email", label: "Garante 2 - Email", type: "text", required: false, placeholder: "garante2@email.com" },
      ],
    },
    {
      title: "Cierre y Firma",
      fields: [
        { name: "cierre_centro_judicial", label: "Centro judicial (jurisdicción)", type: "text", required: true, placeholder: "San Miguel de Tucumán" },
        { name: "cierre_cantidad_ejemplares", label: "Cantidad de ejemplares", type: "number", required: true, placeholder: "2" },
        { name: "cierre_ciudad_firma", label: "Ciudad de firma", type: "text", required: true, placeholder: "San Miguel de Tucumán" },
        { name: "cierre_departamento_firma", label: "Departamento de firma", type: "text", required: true, placeholder: "Capital" },
        { name: "cierre_provincia_firma", label: "Provincia de firma", type: "text", required: true, placeholder: "Tucumán" },
        { name: "cierre_fecha_firma", label: "Fecha de firma", type: "date", required: true },
      ],
    },
  ],
  "convenio-confidencialidad": [
    {
      title: "Primera Parte",
      fields: [
        { name: "parte_a_nombre_razon_social", label: "Nombre o razón social", type: "text", required: true, placeholder: "Empresa o nombre completo" },
        { name: "parte_a_domicilio", label: "Domicilio constituido", type: "text", required: true, placeholder: "Dirección completa" },
      ],
    },
    {
      title: "Segunda Parte",
      fields: [
        { name: "parte_b_nombre_razon_social", label: "Nombre o razón social", type: "text", required: true, placeholder: "Empresa o nombre completo" },
        { name: "parte_b_domicilio", label: "Domicilio constituido", type: "text", required: true, placeholder: "Dirección completa" },
      ],
    },
    {
      title: "Jurisdicción",
      fields: [
        { name: "jurisdiccion_tribunales", label: "Tribunales competentes", type: "text", required: true, placeholder: "Ciudad de Buenos Aires" },
      ],
    },
  ],
  "locacion-servicios-profesionales": [
    {
      title: "Datos del Prestador",
      fields: [
        { name: "prestador_nombre_profesion", label: "Nombre y profesión del prestador", type: "text", required: true, placeholder: "Dr. Juan Pérez, médico clínico M.N. 12345" },
        { name: "prestador_domicilio", label: "Domicilio completo del prestador", type: "text", required: true, placeholder: "Av. San Martín 1234, San Miguel de Tucumán, Tucumán" },
      ],
    },
    {
      title: "Datos del Cliente",
      fields: [
        { name: "cliente_nombre_razon_social", label: "Nombre o razón social del cliente", type: "text", required: true, placeholder: "Clínica del Sol S.A." },
        { name: "cliente_domicilio", label: "Domicilio completo del cliente", type: "text", required: true, placeholder: "Corrientes 500, San Miguel de Tucumán, Tucumán" },
      ],
    },
    {
      title: "Servicio Contratado",
      fields: [
        { name: "servicio_descripcion", label: "Descripción del servicio", type: "textarea", required: true, placeholder: "atención médica de guardia y consultas ambulatorias" },
        { name: "servicio_tipo_establecimiento", label: "Tipo de establecimiento", type: "text", required: true, placeholder: "consultorio, clínica, estudio jurídico, empresa..." },
      ],
    },
    {
      title: "Cierre y Jurisdicción",
      fields: [
        { name: "cierre_jurisdiccion", label: "Jurisdicción (tribunales)", type: "text", required: true, placeholder: "San Miguel de Tucumán" },
      ],
    },
  ],
};

// Default steps for contracts without specific wizard
export const DEFAULT_WIZARD_STEPS = [
  {
    title: "Datos de la Parte A",
    fields: [
      { name: "parte_a_nombre", label: "Nombre completo", type: "text", required: true, placeholder: "Nombre y apellido" },
      { name: "parte_a_dni", label: "DNI/CUIT", type: "text", required: true, placeholder: "12.345.678" },
      { name: "parte_a_domicilio", label: "Domicilio", type: "text", required: true, placeholder: "Dirección completa" },
      { name: "parte_a_estado_civil", label: "Estado civil", type: "select", required: true, options: ["Soltero/a", "Casado/a", "Divorciado/a", "Viudo/a"] },
    ],
  },
  {
    title: "Datos de la Parte B",
    fields: [
      { name: "parte_b_nombre", label: "Nombre completo", type: "text", required: true, placeholder: "Nombre y apellido" },
      { name: "parte_b_dni", label: "DNI/CUIT", type: "text", required: true, placeholder: "23.456.789" },
      { name: "parte_b_domicilio", label: "Domicilio", type: "text", required: true, placeholder: "Dirección completa" },
      { name: "parte_b_estado_civil", label: "Estado civil", type: "select", required: true, options: ["Soltero/a", "Casado/a", "Divorciado/a", "Viudo/a"] },
    ],
  },
  {
    title: "Objeto del Contrato",
    fields: [
      { name: "objeto_descripcion", label: "Descripción del objeto", type: "textarea", required: true, placeholder: "Describa el objeto del contrato" },
      { name: "objeto_condiciones", label: "Condiciones especiales", type: "textarea", required: false, placeholder: "Condiciones particulares (opcional)" },
    ],
  },
  {
    title: "Condiciones Económicas",
    fields: [
      { name: "monto", label: "Monto ($)", type: "number", required: true, placeholder: "0" },
      { name: "forma_pago", label: "Forma de pago", type: "select", required: true, options: ["Efectivo", "Transferencia bancaria", "Cheque", "Otro"] },
      { name: "plazo", label: "Plazo", type: "text", required: true, placeholder: "Ej: 12 meses" },
    ],
  },
  {
    title: "Firma",
    fields: [
      { name: "lugar_firma", label: "Lugar de firma", type: "text", required: true, placeholder: "Ciudad" },
      { name: "fecha_firma", label: "Fecha de firma", type: "date", required: true },
    ],
  },
];

const COMMERCIAL_V9_GROUPS = [
  ["Datos del Locador", ["locador_nombre_completo", "locador_dni", "locador_cuit_cuil", "locador_correo_electronico", "locador_domicilio", "locador_ciudad", "locador_departamento_partido", "locador_provincia"]],
  ["Datos del Locatario", ["locatario_nombre_completo", "locatario_dni", "locatario_cuit_cuil", "locatario_correo_electronico", "locatario_domicilio", "locatario_ciudad", "locatario_departamento_partido", "locatario_provincia"]],
  ["Datos del Inmueble", ["inmueble_calle", "inmueble_altura", "inmueble_piso_y_numero_local", "inmueble_nomenclatura_catastral", "inmueble_partida_inmobiliaria", "inmueble_destino_locacion", "inmueble_destino_otro"]],
  ["Plazo", ["plazo_cantidad_meses_numeros", "plazo_cantidad_anos_numeros", "plazo_inicio_dia", "plazo_inicio_mes", "plazo_inicio_ano", "plazo_fin_dia", "plazo_fin_mes", "plazo_fin_ano"]],
  ["Condiciones económicas", ["condiciones_economicas_monto_mensual_numeros", "condiciones_economicas_periodo_primer_pago", "condiciones_economicas_pago_desde_dia", "condiciones_economicas_pago_hasta_dia", "condiciones_economicas_porcentaje_interes_numeros", "condiciones_economicas_primer_dia_mora", "condiciones_economicas_ultimo_dia_condonacion", "condiciones_economicas_periodo_actualizacion_meses", "condiciones_economicas_indice_actualizacion", "condiciones_economicas_indice_actualizacion_otro", "condiciones_economicas_dias_notificacion_rescision", "condiciones_economicas_dias_aviso_menor_rescision", "condiciones_economicas_meses_indemnizacion_menor_plazo_numeros", "condiciones_economicas_monto_deposito_numeros", "condiciones_economicas_dias_restitucion_deposito", "condiciones_economicas_parte_a_cargo_sellado"]],
  ["Garante", ["garantes_g1_nombre", "garantes_g1_dni", "garantes_g1_cuit_cuil", "garantes_g1_correo_electronico", "garantes_g1_domicilio_calle", "garantes_g1_ciudad", "garantes_g1_departamento", "garantes_g1_provincia", "garantes_g1_nacionalidad", "garantes_g2_texto"]],
  ["Cierre y firma", ["cierre_centro_judicial", "cierre_cantidad_ejemplares_numeros", "cierre_ciudad_firma", "cierre_departamento_firma", "cierre_provincia_firma", "cierre_dia_firma", "cierre_mes_firma", "cierre_ano_firma"]],
];

const COMMERCIAL_V9_OPTIONAL = new Set(["garantes_g1_nombre", "garantes_g1_dni", "garantes_g1_cuit_cuil", "garantes_g1_correo_electronico", "garantes_g1_domicilio_calle", "garantes_g1_ciudad", "garantes_g1_departamento", "garantes_g1_provincia", "garantes_g1_nacionalidad", "garantes_g2_texto"]);
const COMMERCIAL_PROVINCES = PROVINCE_OPTIONS;
const COMMERCIAL_MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const COMMERCIAL_V9_FIELD_CONFIG = {
  locador_provincia: { type: "select", options: COMMERCIAL_PROVINCES },
  locatario_provincia: { type: "select", options: COMMERCIAL_PROVINCES },
  garantes_g1_provincia: { type: "select", options: COMMERCIAL_PROVINCES },
  cierre_provincia_firma: { type: "select", options: COMMERCIAL_PROVINCES },
  plazo_inicio_mes: { type: "select", options: COMMERCIAL_MONTHS },
  plazo_fin_mes: { type: "select", options: COMMERCIAL_MONTHS },
  cierre_mes_firma: { type: "select", options: COMMERCIAL_MONTHS },
  condiciones_economicas_periodo_primer_pago: { type: "select", options: ["mes", "bimestre", "trimestre", "semestre"] },
  condiciones_economicas_indice_actualizacion: { type: "select", options: ["ICL", "IPC", "Otro"] },
  condiciones_economicas_parte_a_cargo_sellado: { type: "select", options: ["LOCATARIA", "LOCADORA"] },
  inmueble_destino_locacion: { type: "select", options: ["Gastronomía", "Oficina", "Consultorio", "Estudio jurídico", "Otro"] },
  inmueble_destino_otro: { visibleWhen: { field: "inmueble_destino_locacion", value: "Otro" }, requiredWhen: { field: "inmueble_destino_locacion", value: "Otro" } },
  condiciones_economicas_indice_actualizacion_otro: { visibleWhen: { field: "condiciones_economicas_indice_actualizacion", value: "Otro" }, requiredWhen: { field: "condiciones_economicas_indice_actualizacion", value: "Otro" } },
};
const COMMERCIAL_V9_STEPS = COMMERCIAL_V9_GROUPS.map(([title, names]) => ({
  title,
  fields: names.map((name) => ({
    name,
    label: name.replace(/_/g, " ").replace(/\bano\b/g, "año").replace(/\banos\b/g, "años"),
    type: /numeros|metros|dia|ano|meses/.test(name) ? "number" : "text",
    required: !COMMERCIAL_V9_OPTIONAL.has(name),
    ...COMMERCIAL_V9_FIELD_CONFIG[name],
  })),
}));

const ESTADOS_CIVILES = ["Soltero/a", "Casado/a", "Divorciado/a", "Viudo/a"];

const ROOM_OPTIONS = ["No tiene", "1", "2", "3", "4", "5", "6"];
const visibleAfterTotal = { field: "inmueble_cantidad_habitaciones", notEmpty: true };
const g1Visible = { field: "garantes_cantidad", oneOf: ["1", "2"] };
const g2Visible = { field: "garantes_cantidad", value: "2" };
const guarantorFields = (number, visibility) => [
  { name: `garantes_g${number}_nombre`, label: `Garante ${number} - Nombre completo`, requiredWhen: visibility },
  { name: `garantes_g${number}_dni`, label: `Garante ${number} - DNI`, requiredWhen: visibility },
  { name: `garantes_g${number}_cuit_cuil`, label: `Garante ${number} - CUIT/CUIL`, requiredWhen: visibility },
  { name: `garantes_g${number}_nacionalidad`, label: `Garante ${number} - Nacionalidad`, requiredWhen: visibility },
  { name: `garantes_g${number}_estado_civil`, label: `Garante ${number} - Estado civil`, type: "select", options: ESTADOS_CIVILES, requiredWhen: visibility },
  { name: `garantes_g${number}_domicilio_calle`, label: `Garante ${number} - Domicilio`, requiredWhen: visibility },
  { name: `garantes_g${number}_ciudad`, label: `Garante ${number} - Ciudad`, requiredWhen: visibility },
  { name: `garantes_g${number}_departamento`, label: `Garante ${number} - Departamento o partido`, requiredWhen: visibility },
  { name: `garantes_g${number}_provincia`, label: `Garante ${number} - Provincia`, type: "select", options: PROVINCE_OPTIONS, requiredWhen: visibility },
  { name: `garantes_g${number}_correo_electronico`, label: `Garante ${number} - Correo electrónico`, requiredWhen: visibility },
].map((field) => ({ ...field, visibleWhen: visibility }));

const VIVIENDA_V9_STEPS = [
  { title: "Datos del locador", fields: [
    { name: "locador_nombre_completo", label: "Nombre completo", required: true }, { name: "locador_dni", label: "DNI", required: true }, { name: "locador_cuit_cuil", label: "CUIT/CUIL", required: true },
    { name: "locador_correo_electronico", label: "Correo electrónico", required: true }, { name: "locador_estado_civil", label: "Estado civil", type: "select", options: ESTADOS_CIVILES, required: true },
    { name: "locador_fecha_nacimiento", label: "Fecha de nacimiento", type: "date", required: true }, { name: "locador_nacionalidad", label: "Nacionalidad", type: "text", required: true },
    { name: "locador_domicilio", label: "Domicilio", required: true }, { name: "locador_ciudad", label: "Ciudad", required: true }, { name: "locador_departamento_partido", label: "Departamento o partido", required: true }, { name: "locador_provincia", label: "Provincia", required: true },
  ]},
  { title: "Datos del locatario", fields: [
    { name: "locatario_nombre_completo", label: "Nombre completo", required: true }, { name: "locatario_dni", label: "DNI", required: true }, { name: "locatario_cuit_cuil", label: "CUIT/CUIL", required: true },
    { name: "locatario_correo_electronico", label: "Correo electrónico", required: true }, { name: "locatario_estado_civil", label: "Estado civil", type: "select", options: ESTADOS_CIVILES, required: true }, { name: "locatario_nacionalidad", label: "Nacionalidad", required: true },
    { name: "locatario_domicilio", label: "Domicilio", required: true }, { name: "locatario_ciudad", label: "Ciudad", required: true }, { name: "locatario_departamento_partido", label: "Departamento o partido", required: true }, { name: "locatario_provincia", label: "Provincia", required: true },
  ]},
  { title: "Datos del inmueble", fields: [
    { name: "inmueble_calle", label: "Calle", required: true }, { name: "inmueble_altura", label: "Altura", required: true },
    { name: "inmueble_piso_departamento_aplica", label: "Piso o Departamento", type: "select", options: ["Aplica", "No aplica"], required: true },
    { name: "inmueble_piso_departamento", label: "Indicar piso o departamento", visibleWhen: { field: "inmueble_piso_departamento_aplica", value: "Aplica" }, requiredWhen: { field: "inmueble_piso_departamento_aplica", value: "Aplica" } },
    { name: "inmueble_nomenclatura_catastral", label: "Nomenclatura catastral", required: true }, { name: "inmueble_partida_inmobiliaria", label: "Partida inmobiliaria", required: true },
    { name: "inmueble_ciudad_inmueble", label: "Ciudad", required: true }, { name: "inmueble_departamento_inmueble", label: "Departamento o partido", required: true }, { name: "inmueble_provincia_inmueble", label: "Provincia", required: true },
    { name: "inmueble_cantidad_habitaciones", label: "Cantidad total de habitaciones", type: "select", options: ROOM_OPTIONS, required: true },
    { name: "inmueble_cantidad_banos", label: "Baño/s", type: "select", options: ROOM_OPTIONS, visibleWhen: visibleAfterTotal, requiredWhen: visibleAfterTotal },
    { name: "inmueble_cantidad_dormitorios", label: "Dormitorio/s", type: "select", options: ROOM_OPTIONS, visibleWhen: visibleAfterTotal, requiredWhen: visibleAfterTotal },
    { name: "inmueble_cantidad_living_comedor", label: "Living-comedor", type: "select", options: ROOM_OPTIONS, visibleWhen: visibleAfterTotal, requiredWhen: visibleAfterTotal },
    { name: "inmueble_cantidad_cocinas", label: "Cocina/s", type: "select", options: ROOM_OPTIONS, visibleWhen: visibleAfterTotal, requiredWhen: visibleAfterTotal },
    { name: "inmueble_cantidad_balcones", label: "Balcón/es", type: "select", options: ROOM_OPTIONS, visibleWhen: visibleAfterTotal, requiredWhen: visibleAfterTotal },
  ]},
  { title: "Plazo del contrato", fields: [
    { name: "plazo_cantidad_meses_numeros", label: "Plazo en meses", type: "number", required: true }, { name: "plazo_inicio_fecha", label: "Fecha de inicio", type: "date", required: true }, { name: "plazo_fin_fecha", label: "Fecha de finalización", type: "date", required: true },
  ]},
  { title: "Condiciones económicas", fields: [
    { name: "condiciones_economicas_monto_mensual_numeros", label: "Monto mensual", type: "text", formatAsCurrency: true, required: true }, { name: "condiciones_economicas_periodo_primer_pago", label: "Periodo de vigencia del precio inicial (previo a primera actualización)", type: "select", options: ["mes", "bimestre", "trimestre", "cuatrimestre", "semestre", "año"], required: true },
    { name: "condiciones_economicas_indice_actualizacion", label: "Índice de actualización", type: "select", options: ["ICL", "IPC", "Otro"], required: true },
    { name: "condiciones_economicas_indice_actualizacion_otro", label: "Especificar índice de actualización", visibleWhen: { field: "condiciones_economicas_indice_actualizacion", value: "Otro" }, requiredWhen: { field: "condiciones_economicas_indice_actualizacion", value: "Otro" } },
    { name: "condiciones_economicas_porcentaje_interes_numeros", label: "Interés mensual por mora (%)", type: "number", required: true }, { name: "condiciones_economicas_servicios_a_cargo", label: "Servicios a cargo del locatario (ej: expensas, luz, agua...)", required: true }, { name: "condiciones_economicas_monto_deposito_numeros", label: "Monto del depósito en garantía", type: "text", formatAsCurrency: true, required: true },
  ]},
  { title: "Garantes", fields: [
    { name: "garantes_cantidad", label: "Garantes", type: "select", options: ["No aplica", "1", "2"], required: true },
    ...guarantorFields(1, g1Visible),
    ...guarantorFields(2, g2Visible),
  ]},
  { title: "Cierre y firma", fields: [
    { name: "cierre_fecha_firma", label: "Fecha de firma", type: "date", required: true },
  ]},
];

const TEMPORARIA_V9_GROUPS = [
  ["Lugar y fecha", ["cierre_encabezado_lugar_y_fecha_celebracion"]],
  ["Datos del Locador", ["locador_nombre_completo", "locador_dni_pasaporte", "locador_cuit_cuil", "locador_domicilio_calle", "locador_altura", "locador_piso_departamento", "locador_localidad", "locador_provincia", "locador_telefono"]],
  ["Datos del Locatario", ["locatario_nombre_completo", "locatario_nacionalidad", "locatario_dni_pasaporte", "locatario_cuit_cuil", "locatario_domicilio_calle", "locatario_altura", "locatario_piso_departamento", "locatario_localidad", "locatario_provincia", "locatario_telefono"]],
  ["Datos del Inmueble", ["inmueble_calle", "inmueble_altura", "inmueble_piso_departamento", "inmueble_localidad", "inmueble_provincia", "inmueble_registro_turistico"]],
  ["Estadía", ["estadia_cantidad_dias_numeros", "estadia_inicio_dia", "estadia_inicio_mes", "estadia_inicio_ano", "estadia_inicio_hora", "estadia_fin_dia", "estadia_fin_mes", "estadia_fin_ano", "estadia_fin_hora", "normas_cantidad_huespedes"]],
  ["Condiciones económicas", ["condiciones_economicas_precio_total_numeros", "condiciones_economicas_moneda", "condiciones_economicas_dia_pago_senia", "condiciones_economicas_porcentaje_senia", "condiciones_economicas_deposito_garantia_numeros", "condiciones_economicas_multa_diaria_demora_numeros"]],
  ["Cierre y firma", ["cierre_centro_judicial", "cierre_cantidad_ejemplares_numeros", "cierre_ciudad_firma", "cierre_dia_firma", "cierre_mes_firma", "cierre_ano_firma"]],
];

const TEMPORARIA_V9_OPTIONAL = new Set(["locador_piso_departamento", "locatario_piso_departamento", "inmueble_registro_turistico"]);
const TEMPORARIA_PROVINCES = PROVINCE_OPTIONS;
const TEMPORARIA_MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const TEMPORARIA_V9_FIELD_CONFIG = {
  locador_provincia: { type: "select", options: TEMPORARIA_PROVINCES },
  locatario_provincia: { type: "select", options: TEMPORARIA_PROVINCES },
  inmueble_provincia: { type: "select", options: TEMPORARIA_PROVINCES },
  estadia_inicio_mes: { type: "select", options: TEMPORARIA_MONTHS },
  estadia_fin_mes: { type: "select", options: TEMPORARIA_MONTHS },
  cierre_mes_firma: { type: "select", options: TEMPORARIA_MONTHS },
  cierre_dia_firma: { type: "text", digitsOnly: true, maxLength: 2 },
  cierre_ano_firma: { type: "text", digitsOnly: true, maxLength: 4 },
  condiciones_economicas_moneda: { type: "select", options: ["Pesos Argentinos", "USD", "Euros"] },
  condiciones_economicas_porcentaje_senia: { type: "number" },
  normas_cantidad_huespedes: { type: "number" },
  inmueble_registro_turistico: { options: ["NO APLICABLE"], placeholder: "Número de registro o NO APLICABLE" },
  condiciones_economicas_deposito_garantia_numeros: { formatAsCurrency: true },
  condiciones_economicas_multa_diaria_demora_numeros: { formatAsCurrency: true },
};
const TEMPORARIA_V9_STEPS = TEMPORARIA_V9_GROUPS.map(([title, names]) => ({
  title,
  fields: names.map((name) => ({
    name,
    label: name.replace(/_/g, " ").replace(/\bano\b/g, "año").replace(/\banos\b/g, "años"),
    type: name.includes("hora") ? "time" : /numeros|_dia$|_ano$/.test(name) ? "number" : "text",
    required: !TEMPORARIA_V9_OPTIONAL.has(name),
    ...TEMPORARIA_V9_FIELD_CONFIG[name],
  })),
}));

export function getContractSteps(contractSlug) {
  const steps = contractSlug === 'locacion-comercial' ? COMMERCIAL_V9_STEPS
    : contractSlug === 'locacion-vivienda' ? VIVIENDA_V9_STEPS
    : contractSlug === 'locacion-temporaria-turistica' ? TEMPORARIA_V9_STEPS
    : WIZARD_STEPS[contractSlug] || DEFAULT_WIZARD_STEPS;
  return calendarSteps(steps, PROVINCE_OPTIONS);
}