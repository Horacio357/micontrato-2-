// Utilidades de cálculo automático para el wizard de contratos.

function parseLooseNumber(raw) {
  if (raw === undefined || raw === null || raw === "") return null;
  const cleaned = String(raw)
    .replace(/[^\d.,-]/g, "")
    .replace(/\.(?=\d{3}(\D|$))/g, "") // quita puntos de miles
    .replace(",", ".");
  const num = parseFloat(cleaned);
  return Number.isFinite(num) ? num : null;
}

/**
 * Detecta un par (monto de cuota) x (cantidad de cuotas) dentro del formulario
 * y devuelve el monto total calculado, o null si no hay datos suficientes.
 */
export function computeMontoTotalCuotas(formData = {}) {
  const cuotaKey = Object.keys(formData).find((k) => /monto.*cuota.*numero|cuota.*numero/i.test(k));
  const countKey = Object.keys(formData).find((k) => /num_cuotas|cantidad_cuotas|numero_cuotas/i.test(k));
  if (!cuotaKey || !countKey) return null;

  const cuota = parseLooseNumber(formData[cuotaKey]);
  const count = parseLooseNumber(formData[countKey]);
  if (!cuota || !count) return null;

  return Math.round(cuota * count * 100) / 100;
}

/**
 * Valida un rango de fechas de inicio/fin.
 * Devuelve un mensaje de error (string) o null si el rango es válido.
 */
export function validateDateRange(startValue, endValue, { maxDays } = {}) {
  if (!startValue || !endValue) return null;

  const start = new Date(startValue);
  const end = new Date(endValue);
  if (isNaN(start) || isNaN(end)) return null;

  if (end <= start) {
    return "La fecha de finalización debe ser posterior a la fecha de inicio.";
  }

  if (maxDays) {
    const diffDays = (end - start) / (1000 * 60 * 60 * 24);
    if (diffDays > maxDays) {
      return `El plazo no puede superar los ${maxDays} días según la normativa vigente para este tipo de contrato.`;
    }
  }

  return null;
}