export const CONTRACT_MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
export const CONTRACT_DATE_GROUPS = [
  { name: 'plazo_inicio_fecha', label: 'Fecha de inicio', parts: ['plazo_inicio_dia', 'plazo_inicio_mes', 'plazo_inicio_ano'] },
  { name: 'plazo_fin_fecha', label: 'Fecha de finalización', parts: ['plazo_fin_dia', 'plazo_fin_mes', 'plazo_fin_ano'] },
  { name: 'estadia_inicio_fecha', label: 'Fecha de ingreso', parts: ['estadia_inicio_dia', 'estadia_inicio_mes', 'estadia_inicio_ano'] },
  { name: 'estadia_fin_fecha', label: 'Fecha de egreso', parts: ['estadia_fin_dia', 'estadia_fin_mes', 'estadia_fin_ano'] },
  { name: 'cierre_fecha_firma', label: 'Fecha de firma', parts: ['cierre_dia_firma', 'cierre_mes_firma', 'cierre_ano_firma'] },
];

export function calendarSteps(steps, provinces) {
  return steps.map((step) => ({ ...step, fields: step.fields.flatMap((field) => {
    const group = CONTRACT_DATE_GROUPS.find((item) => item.parts.includes(field.name));
    if (group) return field.name === group.parts[0] ? [{ ...field, name: group.name, label: group.label, type: 'date', options: undefined }] : [];
    if (field.name.includes('provincia')) return [{ ...field, type: 'select', options: provinces }];
    if (field.name === 'cierre_encabezado_lugar_y_fecha_celebracion') return [
      { name: 'encabezado_ciudad', label: 'Ciudad de celebración', type: 'text', required: field.required },
      { name: 'encabezado_fecha', label: 'Fecha de celebración', type: 'date', required: field.required },
    ];
    if (field.name === 'condiciones_economicas_dia_pago_senia') return [{ ...field, label: 'Fecha de pago de la seña', type: 'date' }];
    return [{ ...field, ...(field.name.includes('fecha') ? { type: 'date' } : {}) }];
  }) }));
}