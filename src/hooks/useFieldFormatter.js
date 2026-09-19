/**
 * Determina el inputMode, pattern y función de formateo según el nombre/tipo del campo.
 */

export function getFieldConfig(fieldName = "", fieldType = "text") {
  const name = fieldName.toLowerCase();

  if (name.includes("dni")) {
    return { inputMode: "numeric", pattern: "[0-9.]*", format: formatDNI, validate: null, maxLength: 10 };
  }
  if (name.includes("cuit") || name.includes("cuil")) {
    return { inputMode: "numeric", pattern: "[0-9\\-]*", format: formatCUIT, validate: validateCUIT, blocking: false, maxLength: 13 };
  }
  if (name.includes("telefono") || name.includes("teléfono") || name.includes("tel") || name.includes("celular")) {
    return { inputMode: "tel", pattern: null, format: formatTelefono, validate: null, maxLength: 20 };
  }
  // Campos "_letras" son texto libre, no numérico
  if (name.includes("_letras") || name.includes("letras")) {
    return { inputMode: null, pattern: null, format: null, validate: null, maxLength: null };
  }
  if (name.includes("monto_numeros") || name.includes("numeros") || name.includes("precio") || name.includes("alquiler") || name.includes("valor") || name.includes("importe") || name.includes("canon_numeros") || name.includes("deposito_numeros") || name.includes("multa")) {
    return { inputMode: "decimal", pattern: "[0-9.]*", format: formatMonto, validate: null, maxLength: 15 };
  }
  if ((name.includes("monto") || name.includes("canon") || name.includes("deposito")) && !name.includes("_letras") && !name.includes("_numeros")) {
    return { inputMode: "decimal", pattern: "[0-9.]*", format: formatMonto, validate: null, maxLength: 15 };
  }
  if (name.includes("superficie") || name.includes("m2") || name.includes("metros") || name.includes("area")) {
    return { inputMode: "numeric", pattern: "[0-9]*", format: formatNumero, validate: null, maxLength: 6 };
  }
  if (name.includes("codigo_postal") || name.includes("cp") || name.includes("postal")) {
    return { inputMode: "numeric", pattern: "[0-9]*", format: formatNumero, validate: null, maxLength: 5 };
  }
  if (fieldType === "number") {
    return { inputMode: "numeric", pattern: "[0-9]*", format: formatNumero, validate: null, maxLength: 10 };
  }

  return { inputMode: null, pattern: null, format: null, validate: null, maxLength: null };
}

export function formatDNI(value) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return digits.slice(0, digits.length - 3) + "." + digits.slice(-3);
  const a = digits.slice(0, digits.length - 6);
  const b = digits.slice(digits.length - 6, digits.length - 3);
  const c = digits.slice(digits.length - 3);
  return a + "." + b + "." + c;
}

export function formatCUIT(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 10) return digits.slice(0, 2) + "-" + digits.slice(2);
  return digits.slice(0, 2) + "-" + digits.slice(2, 10) + "-" + digits.slice(10);
}

export function formatTelefono(value) {
  let digits = value.replace(/[^\d+]/g, "");
  if (!digits.startsWith("+")) {
    digits = digits.replace(/^0/, "");
    if (digits.length > 0 && !digits.startsWith("54")) {
      digits = "549" + digits.replace(/^9/, "");
    }
    digits = "+" + digits;
  }
  return digits.slice(0, 16);
}

export function formatMonto(value) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("es-AR");
}

export function formatNumero(value) {
  return value.replace(/\D/g, "");
}

export function validateCUIT(cuit) {
  const digits = cuit.replace(/\D/g, "");
  if (digits.length !== 11) return "El CUIT debe tener 11 dígitos";

  const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits[i]) * multipliers[i];
  }
  const remainder = sum % 11;
  const verifier = remainder === 0 ? 0 : remainder === 1 ? 9 : 11 - remainder;

  if (verifier !== parseInt(digits[10])) {
    return "El dígito verificador del CUIT es incorrecto";
  }
  return null;
}