export const isDecimalContractField = (fieldName = "") =>
  /(?:monto|precio|canon|alquiler|valor|importe|deposito|cuota|interes|porcentaje|tna|tasa|saldo|senia|multa)/i.test(fieldName) &&
  !/(?:letras|fecha|moneda)/i.test(fieldName);

export function sanitizeNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : '';
  const raw = String(value ?? '').trim().replace(/\s/g, '');
  if (!raw) return '';
  // Los inputs numéricos entregan punto decimal; solo la coma indica formato AR.
  const normalized = raw.includes(',') ? raw.replace(/\./g, '').replace(',', '.') : raw;
  const number = Number(normalized);
  return Number.isFinite(number) ? number : '';
}

export function sanitizeContractFormData(formData) {
  return Object.fromEntries(
    Object.entries(formData).map(([key, value]) => [
      key,
      isDecimalContractField(key) ? sanitizeNumber(value) : value,
    ])
  );
}

const MESES_ES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

// Convierte una fecha "YYYY-MM-DD" (formato nativo de <input type="date">) a texto legal en español.
// Se divide el string en vez de usar new Date() para evitar el desfasaje de zona horaria.
export function formatearFechaLegal(fechaIso) {
  if (!fechaIso) return "";
  const [anio, mes, dia] = fechaIso.split("-");
  if (!anio || !mes || !dia) return fechaIso;
  return `${parseInt(dia, 10)} de ${MESES_ES[parseInt(mes, 10) - 1]} de ${anio}`;
}

const LEGAL_DATE_FIELDS = ["fecha_celebracion", "fecha_ingreso", "fecha_egreso", "fecha_pago_sena", "fecha_vencimiento"];

// Transforma las fechas de calendario a texto legal antes de enviarlas al backend.
export function formatLegalDatesInFormData(formData) {
  const result = { ...formData };
  LEGAL_DATE_FIELDS.forEach((key) => {
    if (result[key]) result[key] = formatearFechaLegal(result[key]);
  });
  return result;
}

// Descompone un único <input type="date"> ("YYYY-MM-DD") en día/mes(texto)/año,
// para contratos cuyo schema (V9) exige esas tres variables separadas.
function splitFechaIso(fechaIso, diaKey, mesKey, anoKey, result) {
  if (!fechaIso) return;
  const [anio, mes, dia] = fechaIso.split("-");
  if (!anio || !mes || !dia) return;
  result[diaKey] = parseInt(dia, 10);
  result[mesKey] = MESES_ES[parseInt(mes, 10) - 1];
  result[anoKey] = parseInt(anio, 10);
}

// Locación de Vivienda: el usuario elige un único calendario para inicio, fin y
// firma; aquí se desglosan en las variables sueltas que espera la plantilla V9.
export function splitTemporariaDateFields(formData) {
  const result = { ...formData };
  const combine = (dia, mes, ano) => dia && mes && ano ? `${dia} de ${mes} de ${ano}` : "";
  result.estadia_inicio_fecha = combine(result.estadia_inicio_dia, result.estadia_inicio_mes, result.estadia_inicio_ano);
  result.estadia_fin_fecha = combine(result.estadia_fin_dia, result.estadia_fin_mes, result.estadia_fin_ano);
  return result;
}

export function splitViviendaDateFields(formData) {
  const result = { ...formData };
  splitFechaIso(result.plazo_inicio_fecha, "plazo_inicio_dia", "plazo_inicio_mes", "plazo_inicio_ano", result);
  splitFechaIso(result.plazo_fin_fecha, "plazo_fin_dia", "plazo_fin_mes", "plazo_fin_ano", result);
  splitFechaIso(result.cierre_fecha_firma, "cierre_dia_firma", "cierre_mes_firma", "cierre_ano_firma", result);

  // Fecha de nacimiento + nacionalidad del locador: la UI los separa en dos
  // inputs, pero el contrato V9 sigue esperando la variable unificada.
  if (result.locador_fecha_nacimiento) {
    result.locador_fecha_nacimiento_nacionalidad =
      `${formatearFechaLegal(result.locador_fecha_nacimiento)}, de nacionalidad ${result.locador_nacionalidad || ""}`;
  }

  // Fecha de nacimiento del locatario: viene de un calendario, el contrato
  // espera el texto legal ("20 de junio de 1990").
  if (result.locatario_fecha_nacimiento) {
    result.locatario_fecha_nacimiento = formatearFechaLegal(result.locatario_fecha_nacimiento);
  }
  return result;
}