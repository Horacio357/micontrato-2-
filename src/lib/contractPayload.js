import { sanitizeNumber, formatearFechaLegal } from '@/lib/contractNumbers';
import { getContractSteps, PROVINCES } from '@/lib/contractsData';
import { CONTRACT_DATE_GROUPS, CONTRACT_MONTHS } from '@/lib/contractDateFields';

function legalDateToIso(value) {
  const match = String(value || '').match(/^(\d{1,2}) de ([a-záéíóú]+) de (\d{4})$/i);
  if (!match) return value || '';
  const month = CONTRACT_MONTHS.indexOf(match[2].toLowerCase());
  return month < 0 ? value : `${match[3]}-${String(month + 1).padStart(2, '0')}-${match[1].padStart(2, '0')}`;
}

export function formatCiudadEncabezado(ciudadRaw) {
  if (!ciudadRaw || String(ciudadRaw).trim() === '' || ciudadRaw === '___________') return '';
  let city = String(ciudadRaw).trim();
  if (/^caba$/i.test(city) || /ciudad aut[oó]noma de buenos aires/i.test(city)) {
    return 'la Ciudad Autónoma de Buenos Aires';
  }
  if (/^la ciudad de /i.test(city)) {
    return city;
  }
  if (/^ciudad de /i.test(city)) {
    return `la ${city}`;
  }
  return `la Ciudad de ${city}`;
}

export function formatFechaEncabezado(fechaRaw, fallbackDay, fallbackMonth, fallbackYear) {
  if (fechaRaw) {
    const raw = String(fechaRaw).trim();
    const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      const year = isoMatch[1];
      const monthIdx = parseInt(isoMatch[2], 10) - 1;
      const day = parseInt(isoMatch[3], 10);
      const monthName = CONTRACT_MONTHS[monthIdx] || isoMatch[2];
      return day === 1
        ? `al primer (1°) día del mes de ${monthName} de ${year}`
        : `a los ${day} días del mes de ${monthName} de ${year}`;
    }
    const slashMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (slashMatch) {
      const day = parseInt(slashMatch[1], 10);
      const monthIdx = parseInt(slashMatch[2], 10) - 1;
      const year = slashMatch[3];
      const monthName = CONTRACT_MONTHS[monthIdx] || slashMatch[2];
      return day === 1
        ? `al primer (1°) día del mes de ${monthName} de ${year}`
        : `a los ${day} días del mes de ${monthName} de ${year}`;
    }
    if (/^a los \d+/i.test(raw) || /^al primer/i.test(raw)) {
      return raw;
    }
    const textMatch = raw.match(/^(\d{1,2})(?:\s*días?)?(?:\s*del\s*mes)?\s*(?:de\s+)?([a-záéíóúñ]+)\s*(?:de|del)?\s*(\d{4})$/i);
    if (textMatch) {
      const day = parseInt(textMatch[1], 10);
      const monthName = textMatch[2].toLowerCase();
      const year = textMatch[3];
      return day === 1
        ? `al primer (1°) día del mes de ${monthName} de ${year}`
        : `a los ${day} días del mes de ${monthName} de ${year}`;
    }
    return `a los ${raw}`;
  }
  if (fallbackDay && fallbackMonth && fallbackYear) {
    const day = parseInt(fallbackDay, 10);
    const monthName = String(fallbackMonth).toLowerCase();
    const year = fallbackYear;
    return day === 1
      ? `al primer (1°) día del mes de ${monthName} de ${year}`
      : `a los ${day} días del mes de ${monthName} de ${year}`;
  }
  return '';
}

export function buildLugarYFechaEncabezado(data = {}) {
  const existing = String(data.cierre_encabezado_lugar_y_fecha_celebracion || '').trim();
  if (existing && !existing.includes('___________')) {
    return existing.replace(/^En\s+/i, '');
  }

  const rawCiudad = data.encabezado_ciudad || data.lugar_celebracion || data.cierre_ciudad_firma || data.inmueble_localidad || data.locador_localidad;
  const ciudadFormatted = formatCiudadEncabezado(rawCiudad);

  const rawFecha = data.encabezado_fecha || data.fecha_celebracion || data.cierre_fecha_firma;
  const fechaFormatted = formatFechaEncabezado(
    rawFecha,
    data.cierre_dia_firma,
    data.cierre_mes_firma,
    data.cierre_ano_firma
  );

  if (ciudadFormatted && fechaFormatted) {
    return `${ciudadFormatted}, ${fechaFormatted}`;
  }
  if (ciudadFormatted && !fechaFormatted) {
    return `${ciudadFormatted}, a los ___________`;
  }
  if (!ciudadFormatted && fechaFormatted) {
    return `___________, ${fechaFormatted}`;
  }
  return '___________, a los ___________';
}

export function prepareContractPayload(contractSlug, formData) {
  const payload = { ...(formData || {}) };
  const fields = getContractSteps(contractSlug).flatMap((step) => step.fields);
  // Solo convertir campos numéricos declarados: nunca moneda, fechas ni texto legal.
  fields.filter((field) => field.type === 'number').forEach((field) => {
    const value = payload[field.name];
    payload[field.name] = field.formatAsCurrency ? String(value ?? '') : sanitizeNumber(value);
  });
  CONTRACT_DATE_GROUPS.forEach(({ name, parts }) => {
    if (!fields.some((field) => field.name === name)) return;
    const iso = legalDateToIso(payload[name]);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return;
    const [year, month, day] = iso.split('-');
    [payload[parts[0]], payload[parts[1]], payload[parts[2]]] = [Number(day), CONTRACT_MONTHS[Number(month) - 1], Number(year)];
  });
  fields.filter((field) => field.type === 'date').forEach(({ name }) => {
    const iso = legalDateToIso(payload[name]);
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) payload[name] = formatearFechaLegal(iso);
  });
  if (contractSlug === 'mutuo-oneroso') {
    if (payload.incluir_fiador !== 'Sí') {
      ['nombre', 'nacionalidad', 'estado_civil', 'dni', 'cuit_cuil', 'domicilio_calle', 'altura', 'localidad', 'provincia'].forEach((field) => {
        payload[`garantes_g1_${field}_opcional`] = '';
      });
    }
    payload.garantes = {
      g1_nombre_opcional: payload.garantes_g1_nombre_opcional || '',
      g1_nacionalidad_opcional: payload.garantes_g1_nacionalidad_opcional || '',
      g1_estado_civil_opcional: payload.garantes_g1_estado_civil_opcional || '',
      g1_dni_opcional: payload.garantes_g1_dni_opcional || '',
      g1_cuit_cuil_opcional: payload.garantes_g1_cuit_cuil_opcional || '',
      g1_domicilio_calle_opcional: payload.garantes_g1_domicilio_calle_opcional || '',
      g1_altura_opcional: payload.garantes_g1_altura_opcional || '',
      g1_localidad_opcional: payload.garantes_g1_localidad_opcional || '',
      g1_provincia_opcional: payload.garantes_g1_provincia_opcional || '',
    };
  }
  if (contractSlug === 'locacion-vivienda') {
    const capitalizeNacionalidad = (value) => {
      if (!value) return value;
      return value.split(' ').map((word, i) => {
        const lower = word.toLowerCase();
        if (i > 0 && ['de', 'del', 'da', 'di', 'la', 'las', 'los', 'van', 'y', 'e'].includes(lower)) return lower;
        return word.charAt(0).toUpperCase() + word.slice(1);
      }).join(' ');
    };
    payload.locador_fecha_nacimiento_nacionalidad = `${payload.locador_fecha_nacimiento || '___________'}, de nacionalidad ${capitalizeNacionalidad(payload.locador_nacionalidad) || '___________'}`;
    payload.inmueble_piso_departamento = payload.inmueble_piso_departamento_aplica === 'Aplica'
      ? payload.inmueble_piso_departamento || '___________'
      : 'No aplica';
    const environment = (value, singular, plural) => {
      if (!value || value === 'No tiene') return '';
      return `${value} ${String(value) === '1' ? singular : plural}`;
    };
    payload.inmueble_habitaciones_detalle = [
      environment(payload.inmueble_cantidad_banos, 'baño', 'baños'),
      environment(payload.inmueble_cantidad_dormitorios, 'dormitorio', 'dormitorios'),
      environment(payload.inmueble_cantidad_living_comedor, 'living-comedor', 'living-comedor'),
      environment(payload.inmueble_cantidad_cocinas, 'cocina', 'cocinas'),
      environment(payload.inmueble_cantidad_balcones, 'balcón', 'balcones'),
    ].filter(Boolean).join(', ') || 'sin ambientes adicionales detallados';
  }
  if (contractSlug === 'locacion-comercial') {
    payload.inmueble_piso_y_numero_local = payload.inmueble_piso_y_numero_local_aplica === 'Aplica'
      ? payload.inmueble_piso_y_numero_local || '___________'
      : 'No aplica';
    if (payload.plazo_cantidad_meses_numeros && !payload.plazo_cantidad_anos_numeros) {
      payload.plazo_cantidad_anos_numeros = Math.round(Number(payload.plazo_cantidad_meses_numeros) / 12) || 1;
    }
    if (payload.garantes_cantidad === 'No aplica') {
      ['nombre', 'dni', 'cuit_cuil', 'correo_electronico', 'domicilio_calle', 'ciudad', 'departamento', 'provincia', 'nacionalidad'].forEach((f) => {
        payload[`garantes_g1_${f}`] = '';
      });
      payload.garantes_g2_texto = '';
    }
  }
  if (contractSlug === 'locacion-temporaria-turistica') {
    payload.cierre_encabezado_lugar_y_fecha_celebracion = buildLugarYFechaEncabezado(payload);
    payload.locador_piso_departamento = payload.locador_piso_departamento_aplica === 'Aplica'
      ? payload.locador_piso_departamento || '___________'
      : 'No aplica';
    payload.locatario_piso_departamento = payload.locatario_piso_departamento_aplica === 'Aplica'
      ? payload.locatario_piso_departamento || '___________'
      : 'No aplica';
    payload.inmueble_piso_departamento = payload.inmueble_piso_departamento_aplica === 'Aplica'
      ? payload.inmueble_piso_departamento || '___________'
      : 'No aplica';
    payload.inmueble_registro_turistico = payload.inmueble_registro_turistico_aplica === 'Aplica'
      ? payload.inmueble_registro_turistico || ''
      : '';
  }
  return payload;
}

export function restoreContractFormData(contractSlug, formData) {
  const restored = { ...(formData || {}) };
  const fields = getContractSteps(contractSlug).flatMap((step) => step.fields);
  CONTRACT_DATE_GROUPS.forEach(({ name, parts }) => {
    if (!fields.some((field) => field.name === name)) return;
    const [day, month, year] = parts.map((key) => restored[key]);
    if (!restored[name] && day && month && year) restored[name] = `${day} de ${month} de ${year}`;
  });
  if (contractSlug === 'mutuo-oneroso') {
    const oldKeys = {
      g1_nombre_opcional: 'garante_nombre_completo', g1_nacionalidad_opcional: 'garante_nacionalidad',
      g1_estado_civil_opcional: 'garante_estado_civil', g1_dni_opcional: 'garante_dni',
      g1_cuit_cuil_opcional: 'garante_cuit_cuil', g1_domicilio_calle_opcional: 'garante_calle',
      g1_altura_opcional: 'garante_altura', g1_localidad_opcional: 'garante_localidad',
      g1_provincia_opcional: 'garante_provincia',
    };
    Object.entries(oldKeys).forEach(([nestedKey, oldKey]) => {
      restored[`garantes_${nestedKey}`] = restored.garantes?.[nestedKey] ?? restored[`garantes_${nestedKey}`] ?? restored[oldKey] ?? '';
    });
    if (/d[oó]lar|usd/i.test(restored.moneda || '')) restored.moneda = 'USD';
    else if (/peso/i.test(restored.moneda || '')) restored.moneda = 'Pesos Argentinos';
  }
  if (contractSlug === 'locacion-vivienda') {
    if (!restored.locador_fecha_nacimiento) {
      const match = String(restored.locador_fecha_nacimiento_nacionalidad || '').match(/^(.*?), de nacionalidad (.*)$/);
      if (match) { restored.locador_fecha_nacimiento = match[1]; restored.locador_nacionalidad = match[2]; }
    }
    ['inmueble_cantidad_habitaciones', 'inmueble_cantidad_banos', 'inmueble_cantidad_dormitorios', 'inmueble_cantidad_living_comedor', 'inmueble_cantidad_cocinas', 'inmueble_cantidad_balcones'].forEach((key) => {
      if (restored[key] !== undefined && restored[key] !== null) restored[key] = String(restored[key]);
    });
  }
  if (contractSlug === 'locacion-comercial') {
    if (!restored.inmueble_piso_y_numero_local_aplica) {
      restored.inmueble_piso_y_numero_local_aplica = restored.inmueble_piso_y_numero_local && restored.inmueble_piso_y_numero_local !== 'No aplica' ? 'Aplica' : 'No aplica';
    }
    if (!restored.garantes_cantidad) {
      restored.garantes_cantidad = restored.garantes_g1_nombre ? '1' : 'No aplica';
    }
  }
  if (contractSlug === 'locacion-temporaria-turistica') {
    if (!restored.locador_piso_departamento_aplica) {
      restored.locador_piso_departamento_aplica = restored.locador_piso_departamento && restored.locador_piso_departamento !== 'No aplica' ? 'Aplica' : 'No aplica';
    }
    if (!restored.locatario_piso_departamento_aplica) {
      restored.locatario_piso_departamento_aplica = restored.locatario_piso_departamento && restored.locatario_piso_departamento !== 'No aplica' ? 'Aplica' : 'No aplica';
    }
    if (!restored.inmueble_piso_departamento_aplica) {
      restored.inmueble_piso_departamento_aplica = restored.inmueble_piso_departamento && restored.inmueble_piso_departamento !== 'No aplica' ? 'Aplica' : 'No aplica';
    }
    if (!restored.inmueble_registro_turistico_aplica) {
      restored.inmueble_registro_turistico_aplica = restored.inmueble_registro_turistico && !['No aplica', 'NO APLICABLE', ''].includes(restored.inmueble_registro_turistico) ? 'Aplica' : 'No aplica';
    }
    if (!restored.encabezado_ciudad) {
      const combined = String(restored.cierre_encabezado_lugar_y_fecha_celebracion || '').replace(/^En\s+/i, '');
      const match = combined.match(/^(.*?)[,\s]+(?:(?:a los|al primer \(1°\)|al primer)\s+)?(\d{1,2}(?:\s*días?)?(?:\s*del\s*mes)?\s+de\s+[a-záéíóúñ]+\s+de\s+\d{4})\.?$/i);
      if (match) {
        let city = match[1].trim();
        city = city.replace(/^la Ciudad de\s+/i, '').replace(/^la Ciudad Autónoma de\s+/i, 'Ciudad Autónoma de ');
        restored.encabezado_ciudad = city;
        const dateClean = match[2].replace(/\s*días?\s*del\s*mes\s*/i, ' ').trim();
        restored.encabezado_fecha = dateClean;
      } else {
        restored.encabezado_ciudad = restored.lugar_celebracion || restored.cierre_ciudad_firma || restored.inmueble_localidad || '';
        restored.encabezado_fecha = restored.fecha_celebracion || restored.cierre_fecha_firma || (restored.cierre_dia_firma && restored.cierre_mes_firma && restored.cierre_ano_firma ? `${restored.cierre_dia_firma} de ${restored.cierre_mes_firma} de ${restored.cierre_ano_firma}` : '');
      }
    }
  }
  fields.forEach((field) => {
    if (field.formatAsCurrency && restored[field.name] !== undefined) {
      const digits = String(restored[field.name]).replace(/\D/g, '');
      restored[field.name] = digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
    if (field.type === 'date') restored[field.name] = legalDateToIso(restored[field.name]);
    if (field.name.includes('provincia') && restored[field.name]) {
      const value = String(restored[field.name]).replace(/^Provincia de /i, '');
      const province = PROVINCES.find((item) => item.slug === value || item.name.toLowerCase() === value.toLowerCase());
      restored[field.name] = /Ciudad Autónoma de Buenos Aires/i.test(value) ? 'CABA' : province?.name || value;
    }
  });
  return restored;
}