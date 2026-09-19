/**
 * Base de conocimiento legal argentina para generación de contratos.
 * Cada entrada provee el marco normativo que la IA debe respetar estrictamente.
 */

export const LEGAL_FRAMEWORK = {
  general: `
MARCO JURÍDICO GENERAL — REPÚBLICA ARGENTINA
Código Civil y Comercial de la Nación (Ley 26.994, vigente desde 1/8/2015).
- Art. 957: Definición de contrato.
- Art. 958: Libertad de contratación.
- Art. 959: Efecto vinculante.
- Art. 960: Facultades de los jueces.
- Art. 961: Buena fe.
- Art. 1003–1011: Objeto del contrato.
- Art. 1012–1014: Causa del contrato.
- Art. 1015–1036: Forma de los contratos.
Todo contrato debe ser celebrado con capacidad jurídica plena de las partes (art. 22 a 50 CCyCN).
Los contratos deben interpretarse conforme a la buena fe (art. 961 CCyCN).
`,

  "locacion-vivienda": `
LOCACIÓN DE VIVIENDA — MARCO NORMATIVO
Ley 27.551 (Ley de Alquileres, promulgada 30/6/2020 y sus modificatorias).
Código Civil y Comercial de la Nación — Título IV, arts. 1187–1226.

NORMAS IMPERATIVAS A RESPETAR:
1. Plazo mínimo: 3 años para locaciones con destino habitacional (art. 1198 CCyCN mod. ley 27.551). No se puede pactar plazo menor.
2. Actualización del precio: Debe aplicarse el Índice para Contratos de Locación (ICL) del BCRA con frecuencia anual (art. 14 ley 27.551). La actualización semestral o mensual está prohibida salvo reforma posterior.
3. Depósito de garantía: Máximo equivalente al primer mes de alquiler (art. 13 ley 27.551). Debe devolverse al finalizar con actualización.
4. Gastos: Los gastos de sellado e inmobiliaria deben distribuirse en partes iguales entre locador y locatario (art. 11 ley 27.551).
5. Expensas ordinarias: A cargo del locatario. Expensas extraordinarias: a cargo del locador.
6. Rescisión anticipada: El locatario puede rescindir a los 6 meses. Penalidad: 1 mes si es en los primeros 6 meses; medio mes si es después (art. 1221 CCyCN).
7. El inmueble no puede ser sublocado sin autorización expresa del locador.
8. Garantías admisibles: titular registral, aval bancario, seguro de caución, garantía personal con recibo de sueldo.
9. Notificación fehaciente de rescisión: con 3 meses de anticipación mínima.
10. Jurisdicción: se aplica la ley del lugar de situación del inmueble.

CLÁUSULAS OBLIGATORIAS:
- Identificación completa de partes (nombre, DNI, domicilio, estado civil).
- Descripción del inmueble con nomenclatura catastral si fuera posible.
- Precio, forma y lugar de pago.
- Plazo de locación (no menor a 3 años).
- Destino del inmueble.
- Garantías.
- Inventario de estado del inmueble (recomendado).
`,

  "locacion-comercial": `
LOCACIÓN COMERCIAL — MARCO NORMATIVO
Código Civil y Comercial de la Nación — arts. 1187–1226.
Ley 27.551 (aplicación parcial para inmuebles no habitacionales).

NORMAS A RESPETAR:
1. Plazo mínimo: 3 años (art. 1198 CCyCN).
2. Destino: exclusivamente comercial/industrial/de servicios.
3. No aplica el límite de depósito de la ley 27.551 para locaciones comerciales.
4. Actualización del precio: libre pactada entre partes para uso no habitacional.
5. Rescisión anticipada del locatario: posible con aviso fehaciente con 60 días de antelación, con penalidad de 2 meses de alquiler si es antes del primer año.
6. Obras y mejoras: las mejoras realizadas quedan en beneficio del locador salvo pacto en contrario.
7. Subalocación: prohibida salvo autorización expresa.

CLÁUSULAS IMPORTANTES:
- Actividad comercial autorizada (específica).
- Habilitación municipal y permisos a cargo del locatario.
- Rótulos y publicidad exterior.
- Instalaciones y reformas.
`,

  "contrato-trabajo": `
CONTRATO DE TRABAJO — MARCO NORMATIVO
Ley de Contrato de Trabajo N° 20.744 (LCT) y sus modificatorias.
Convenios Colectivos de Trabajo aplicables por actividad.
Ley 24.013 (Ley Nacional de Empleo).

NORMAS IMPERATIVAS:
1. Modalidades: plazo indeterminado (regla general), plazo determinado (solo causas objetivas art. 90 LCT), eventual, por temporada, a tiempo parcial.
2. Contrato a plazo fijo: máximo 5 años; debe constar por escrito; preaviso de 1 mes.
3. Remuneración: no puede ser inferior al Salario Mínimo Vital y Móvil (SMVM). Debe pagarse en períodos máximos de 1 mes.
4. Jornada laboral: máximo 8 horas diarias y 48 semanales (Ley 11.544). Horas extra se abonan con recargo del 50% (días hábiles) o 100% (sábado post 13hs, domingo o feriado).
5. Período de prueba: 3 meses al inicio de toda relación de plazo indeterminado (art. 92 bis LCT). Durante el período de prueba el empleador puede disolver sin indemnización con 15 días de preaviso.
6. Vacaciones: 14 días (1–5 años), 21 días (5–10 años), 28 días (10–20 años), 35 días (más de 20 años).
7. Indemnización por despido: 1 mes de la mejor remuneración mensual normal y habitual por año de servicio o fracción mayor a 3 meses (art. 245 LCT).
8. Preaviso: 15 días (período de prueba), 1 mes (menos de 5 años), 2 meses (más de 5 años).
9. Registro obligatorio en AFIP (SIPA) desde el primer día de relación laboral.
10. Cargas sociales: aportes y contribuciones según legislación vigente.

CLÁUSULAS A INCLUIR:
- Categoría y funciones del trabajador.
- Lugar y horario de trabajo.
- Remuneración y forma de pago.
- Convenio colectivo aplicable.
- Período de prueba (si aplica).
`,

  "locacion-servicios": `
LOCACIÓN DE SERVICIOS PROFESIONALES — MARCO NORMATIVO
Código Civil y Comercial de la Nación — arts. 1251–1279 (contrato de obra y servicios).
Ley 24.467 y normativa AFIP sobre monotributo y autónomos.

NORMAS A RESPETAR:
1. El prestador es INDEPENDIENTE: no hay relación de dependencia, horario fijo ni subordinación jurídica. De lo contrario se presume relación laboral (art. 23 LCT).
2. El prestador debe estar inscripto en AFIP (monotributo o autónomo) y emitir la factura correspondiente.
3. Precio: libre pactado. Puede ser por hora, por proyecto o por resultado.
4. Propiedad intelectual: los trabajos realizados pertenecen al comitente salvo pacto en contrario (art. 1278 CCyCN).
5. Plazo: determinado o determinable por la naturaleza del servicio.
6. Rescisión: cualquiera de las partes puede rescindir con preaviso razonable (no inferior a 30 días).
7. No corresponden beneficios laborales (SAC, vacaciones, ART a cargo del comitente).

CLÁUSULAS IMPORTANTES:
- Descripción detallada del servicio.
- Entregables y plazos.
- Honorarios y forma de pago.
- Confidencialidad (recomendada).
- Propiedad intelectual.
`,

  "nda": `
ACUERDO DE CONFIDENCIALIDAD (NDA) — MARCO NORMATIVO
Código Civil y Comercial de la Nación — arts. 1063, 1067, 1716.
Ley 24.766 (Confidencialidad sobre información y productos que estén legítimamente bajo control de una persona).
Ley 11.723 (Propiedad Intelectual).

NORMAS A RESPETAR:
1. La información confidencial debe estar claramente definida y delimitada.
2. Las obligaciones de confidencialidad son ejecutables judicialmente.
3. Plazo: puede ser indefinido para secretos comerciales; determinado para otros tipos de información.
4. Excepciones estándar: información de dominio público, información que el receptor ya conocía, información revelada por terceros legítimamente, requerimiento judicial o administrativo.
5. Penalidades: deben ser razonables para ser ejecutables; no puede ser abusiva (art. 794 CCyCN).
6. Jurisdicción: la pactada por las partes; a falta de pacto, el domicilio del demandado.

CLÁUSULAS ESENCIALES:
- Definición precisa de información confidencial.
- Obligaciones del receptor.
- Exclusiones a la confidencialidad.
- Plazo de vigencia.
- Penalidades por incumplimiento.
- Devolución o destrucción de información.
`,

  "no-competencia": `
ACUERDO DE NO COMPETENCIA — MARCO NORMATIVO
Código Civil y Comercial de la Nación — arts. 958, 1021, 960.
Ley de Contrato de Trabajo — art. 88 (deber de fidelidad durante la relación).

NORMAS A RESPETAR:
1. Razonabilidad: la cláusula debe ser razonable en tiempo (máximo 2 años post relación), territorio (zona geográfica definida) y actividad (sector específico) para ser válida.
2. Contraprestación: para ser ejecutable post empleo, generalmente se requiere una contraprestación económica.
3. Límite constitucional: no puede impedir el ejercicio del derecho al trabajo (art. 14 CN). Si es excesiva, el juez puede reducir su alcance.
4. Aplicación: más amplia en contratos comerciales; más restrictiva en contratos laborales.
`,

  "sociedad-hecho": `
SOCIEDAD DE HECHO / SOCIEDAD SIMPLE — MARCO NORMATIVO
Ley General de Sociedades N° 19.550 — Sección IV (Sociedades no constituidas según los tipos del Capítulo II).
Código Civil y Comercial de la Nación — arts. 1442–1478 (contratos asociativos).

NORMAS A RESPETAR:
1. Las sociedades de la Sección IV no pueden inscribirse en el Registro Público.
2. Los socios responden ilimitada y solidariamente frente a terceros.
3. El contrato puede ser verbal o escrito; se recomienda escritura.
4. No puede tener denominación social con tipo societario (no puede llamarse "S.R.L.", "S.A.", etc.).
5. Para subsanar la falta de tipificación, los socios pueden regularizarse (art. 22–26 LGS).
6. Aportes: bienes, dinero o servicios.
7. Distribución de utilidades y pérdidas: libremente pactada; a falta de pacto, en proporción a los aportes.
8. Administración: cualquier socio puede administrar salvo pacto en contrario.
9. Disolución: por acuerdo unánime, vencimiento del plazo, o causales del art. 94 LGS.
`,

  "cesion-derechos": `
CESIÓN DE DERECHOS — MARCO NORMATIVO
Código Civil y Comercial de la Nación — arts. 1614–1631.

NORMAS A RESPETAR:
1. Pueden cederse todos los derechos excepto los expresamente prohibidos por ley (art. 1616 CCyCN).
2. No son cedibles: derechos inherentes a la persona, derechos con cláusula de no ceder, derechos cuya cesión está prohibida por ley.
3. Forma: debe realizarse por escrito (art. 1618 CCyCN). Si el derecho cedido surge de un instrumento público, la cesión debe ser en instrumento público.
4. Notificación al deudor cedido: la cesión es oponible al deudor cedido desde la notificación fehaciente (art. 1620 CCyCN).
5. Garantía de evicción: el cedente garantiza la existencia y legitimidad del derecho cedido (art. 1628 CCyCN).
6. Precio: puede ser gratuito u oneroso.
`,

  "prestamo-dinero": `
PRÉSTAMO DE DINERO (MUTUO) — MARCO NORMATIVO
Código Civil y Comercial de la Nación — arts. 1525–1532.
Ley 25.065 (Tarjetas de crédito, referencial para intereses).

NORMAS A RESPETAR:
1. El mutuario (quien recibe) debe devolver igual cantidad de cosas de la misma especie y calidad (art. 1525 CCyCN).
2. Intereses: deben pactarse expresamente. Los intereses excesivos pueden ser reducidos judicialmente (art. 771 CCyCN).
3. Tasa de interés: no puede superar dos veces la tasa activa del Banco Nación para operaciones de descuento (criterio jurisprudencial dominante).
4. Si no se pactan intereses compensatorios, el préstamo se presume gratuito (art. 1527 CCyCN).
5. Plazo de devolución: libremente pactado. Si no se pacta, el mutuario puede devolver en cualquier momento.
6. Forma: no requiere forma solemne para bienes muebles fungibles; se recomienda escritura para seguridad probatoria.
7. Mora automática: al vencimiento del plazo pactado.
`,

  "compraventa-inmueble": `
BOLETO DE COMPRAVENTA DE INMUEBLE — MARCO NORMATIVO
Código Civil y Comercial de la Nación — arts. 1123–1171, 1170–1171 (boleto de compraventa).
Ley 17.801 (Registro de la Propiedad Inmueble).

NORMAS A RESPETAR:
1. La transmisión del dominio se perfecciona con la escritura pública e inscripción registral (art. 1017 CCyCN). El boleto es un contrato preliminar.
2. El boleto de compraventa otorga al comprador el derecho a exigir la escrituración (art. 1170 CCyCN).
3. Seña: si se entrega seña confirmatoria (art. 1059 CCyCN), el contrato queda perfeccionado; si es penitencial (art. 1060), cualquiera puede arrepentirse perdiendo la seña o devolviendo el doble.
4. COTI: obligatoria para operaciones que superen el valor establecido por AFIP (consultar vigencia).
5. ITI (Impuesto a la Transferencia de Inmuebles): a cargo del vendedor sobre el valor de venta; 1,5% si no es habitación propia.
6. Certificados previos a escriturar: libre deuda municipal, libre deuda de expensas, certificado de dominio e inhibición.
7. Posesión: puede entregarse antes o en el momento de la escrituración.
8. El vendedor garantiza la evicción (art. 1044 CCyCN).
`,

  "distribucion": `
CONTRATO DE DISTRIBUCIÓN — MARCO NORMATIVO
Código Civil y Comercial de la Nación — arts. 1479–1501 (agencia) y ss. (concesión, franquicia).
No existe una ley específica de distribución; se rige por el CCyCN y la autonomía de la voluntad.

NORMAS A RESPETAR:
1. El distribuidor actúa en nombre y por cuenta propia; compra y revende (a diferencia del agente que actúa por cuenta ajena).
2. Exclusividad territorial: debe pactarse expresamente.
3. Plazo: determinado o indeterminado. Si es indeterminado, el preaviso debe ser proporcional a la duración de la relación.
4. Preaviso para rescisión: mínimo 1 mes por año de relación comercial (criterio jurisprudencial).
5. No hay relación laboral ni de dependencia entre las partes.
6. Política de precios y descuentos: el fabricante/proveedor puede sugerir precios de reventa pero no puede imponerlos (Ley 25.156 de Defensa de la Competencia).
7. Indemnización por clientela: no está regulada expresamente; puede pactarse contractualmente.
`,

  "donacion": `
CONTRATO DE DONACIÓN — MARCO NORMATIVO
Código Civil y Comercial de la Nación — arts. 1542–1573.

NORMAS A RESPETAR:
1. Donación de bienes inmuebles: debe hacerse por escritura pública (art. 1552 CCyCN).
2. Donación de bienes muebles: puede ser verbal con entrega simultánea o por escrito.
3. Capacidad: el donante debe tener plena capacidad. Las donaciones de menores requieren autorización judicial.
4. Revocación: el donante puede revocar por ingratitud del donatario (art. 1569–1570 CCyCN).
5. Donaciones con cargo: el donatario debe cumplir el cargo so pena de revocación.
6. Inoficiosa: la donación que afecta la legítima de los herederos forzosos puede ser reducida (art. 1565 CCyCN).
7. Aceptación: debe ser expresa en el instrumento o en acto posterior notificado al donante.
`,

  "permuta": `
CONTRATO DE PERMUTA — MARCO NORMATIVO
Código Civil y Comercial de la Nación — arts. 1172–1175.
Se aplican supletoriamente las normas de compraventa.

NORMAS A RESPETAR:
1. Cada parte es vendedora de la cosa que da y compradora de la que recibe (art. 1172 CCyCN).
2. Los gastos de la permuta se reparten por mitades salvo pacto en contrario (art. 1175 CCyCN).
3. Si los bienes no son de igual valor, puede pactarse una diferencia en dinero (saldo).
4. Garantía de evicción: la parte que pierde la cosa recibida por evicción puede pedir el valor de la cosa dada o la devolución de ésta (art. 1174 CCyCN).
5. Permuta de inmuebles: requiere escritura pública.
`,

  "comodato-inmueble": `
COMODATO DE INMUEBLE — MARCO NORMATIVO
Código Civil y Comercial de la Nación — arts. 1533–1541.

NORMAS A RESPETAR:
1. Es esencialmente gratuito (art. 1533 CCyCN). Si hay contraprestación, pasa a ser locación.
2. El comodatario debe usar la cosa conforme al destino pactado o a su naturaleza.
3. El comodatario no puede ceder el uso sin autorización del comodante.
4. El comodante puede solicitar la restitución anticipada si la necesita por urgencia imprevista (art. 1539 CCyCN).
5. El comodatario responde por los deterioros causados por su culpa.
6. Gastos ordinarios: a cargo del comodatario. Gastos extraordinarios: a cargo del comodante si los hizo con conocimiento.
7. Muerte del comodatario: los herederos deben restituir la cosa (art. 1541 CCyCN).
`,

  "reserva-inmueble": `
RESERVA / SEÑA DE INMUEBLE — MARCO NORMATIVO
Código Civil y Comercial de la Nación — arts. 1059–1060, 1170–1171.
Usos y costumbres inmobiliarios de la República Argentina.

NORMAS A RESPETAR:
1. Seña confirmatoria (art. 1059 CCyCN): su entrega confirma el contrato. Quien se arrepiente pierde la seña; quien la recibió y se arrepiente devuelve el doble.
2. Seña penitencial (art. 1060 CCyCN): permite arrepentirse pagando el precio señado.
3. La suma entregada como seña se imputa al precio final salvo pacto en contrario.
4. Deben constar los datos del inmueble, precio total de venta, plazo para escriturar y condiciones de financiación.
5. Corredor inmobiliario: honorarios del 4% al vendedor y 4% al comprador (varía por provincia; verificar ley provincial aplicable).
`
};

/**
 * Retorna el contexto legal específico para un tipo de contrato.
 */
export function getLegalContext(contractSlug) {
  const specific = LEGAL_FRAMEWORK[contractSlug] || "";
  return `${LEGAL_FRAMEWORK.general}\n\n${specific}`;
}

/**
 * Retorna el nombre de provincia formateado para el contrato.
 */
export const PROVINCE_NAMES = {
  "caba": "Ciudad Autónoma de Buenos Aires",
  "buenos-aires": "Provincia de Buenos Aires",
  "cordoba": "Provincia de Córdoba",
  "santa-fe": "Provincia de Santa Fe",
  "mendoza": "Provincia de Mendoza",
  "tucuman": "Provincia de Tucumán",
  "entre-rios": "Provincia de Entre Ríos",
  "salta": "Provincia de Salta",
};