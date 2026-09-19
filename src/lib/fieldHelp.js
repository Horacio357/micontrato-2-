// Ayuda contextual para campos técnicos o poco conocidos del wizard.
// Se evalúa por coincidencia de palabra clave en el nombre del campo.
const HELP_PATTERNS = [
  { test: /nomenclatura_catastral/i, text: "Código que identifica la ubicación catastral del inmueble. Lo encontrás en la escritura, el último recibo de impuesto inmobiliario o consultando en el municipio/catastro provincial." },
  { test: /partida_inmobiliaria|inmueble_partida/i, text: "Número de partida con el que el inmueble está registrado ante la Dirección de Rentas o el organismo de recaudación provincial. Figura en la boleta de impuesto inmobiliario." },
  { test: /registro_turismo|numero_registro_habilitacion|registro_habilitacion/i, text: "Número de inscripción del inmueble en el registro municipal/provincial de alquileres turísticos. Si tu localidad no lo exige, escribí \"NO APLICA\"." },
  { test: /indice_incremento|actualizacion_indice/i, text: "Índice usado para actualizar el precio del alquiler. El más común es el ICL (Índice para Contratos de Locación) que publica el BCRA, aunque también se puede usar IPC u otro acordado entre las partes." },
  { test: /^tna_|_tna_|tna_numeros/i, text: "Tasa Nominal Anual: el interés total que se cobra por año, sin capitalizar. Se calcula multiplicando la tasa mensual por 12." },
  { test: /cuil_cuit|cuit_cuil|_cuit\b|_cuil\b|cuil_t/i, text: "Clave Única de Identificación Laboral/Tributaria. Tiene 11 dígitos con el formato XX-XXXXXXXX-X. La encontrás en la constancia de AFIP o en el DNI (para el CUIL)." },
  { test: /cbu_cvu/i, text: "Clave Bancaria Uniforme (cuenta bancaria) o Clave Virtual Uniforme (billetera virtual). Tiene 22 dígitos." },
  { test: /senia_porcentaje|saldo_porcentaje/i, text: "Porcentaje del monto total que se paga en este concepto. La suma de seña + saldo debe ser 100%." },
  { test: /multa_diaria/i, text: "Monto que deberá pagar la parte incumplidora por cada día de demora (por ejemplo, en la devolución de llaves)." },
  { test: /deposito_numeros|deposito_letras/i, text: "Monto que el inquilino entrega como garantía y que se devuelve al finalizar el contrato si no hay daños ni deudas pendientes." },
  { test: /interes_.*numeros|interes_mora|interes_moratorio|interes_punitorio/i, text: "Porcentaje que se cobra como penalidad por pagar fuera de término." },
  { test: /ejemplares_numeros|ejemplares_letras|ejemplares_numero/i, text: "Cantidad de copias firmadas del contrato que se van a emitir (generalmente una para cada parte)." },
  { test: /ciudad_jurisdiccion|centro_judicial|cierre_jurisdiccion/i, text: "Ciudad cuyos tribunales resolverán cualquier conflicto derivado del contrato. Suele ser la ciudad donde está el inmueble o donde viven las partes." },
  { test: /estado_civil/i, text: "Situación civil actual de la persona: soltero/a, casado/a, divorciado/a o viudo/a." },
  { test: /kw_luz/i, text: "Cantidad de kilowatts de consumo eléctrico incluidos en el alquiler antes de cobrar el excedente por medidor." },
];

export function getFieldHelp(fieldName = "") {
  const match = HELP_PATTERNS.find((p) => p.test.test(fieldName));
  return match ? match.text : null;
}