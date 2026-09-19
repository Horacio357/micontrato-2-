import comercialV9Json from '../../base44/functions/generateContractAI/templates/comercial-v9.ts';
import viviendaV9Json from '../../base44/functions/generateContractAI/templates/vivienda-v9.ts';
import temporariaV9Json from '../../base44/functions/generateContractAI/templates/temporaria-v9.ts';

const PROVINCE_NAMES = {
  "caba": "Ciudad Autónoma de Buenos Aires",
  "buenos-aires": "Provincia de Buenos Aires",
  "cordoba": "Provincia de Córdoba",
  "santa-fe": "Provincia de Santa Fe",
  "mendoza": "Provincia de Mendoza",
  "tucuman": "Provincia de Tucumán",
  "entre-rios": "Provincia de Entre Ríos",
  "salta": "Provincia de Salta",
  "neuquen": "Provincia de Neuquén",
  "rio-negro": "Provincia de Río Negro",
  "misiones": "Provincia de Misiones",
  "san-juan": "Provincia de San Juan",
  "jujuy": "Provincia de Jujuy",
  "chaco": "Provincia de Chaco",
  "corrientes": "Provincia de Corrientes",
  "santiago-del-estero": "Provincia de Santiago del Estero",
  "formosa": "Provincia de Formosa",
  "chubut": "Provincia de Chubut",
  "san-luis": "Provincia de San Luis",
  "catamarca": "Provincia de Catamarca",
  "la-rioja": "Provincia de La Rioja",
  "la-pampa": "Provincia de La Pampa",
  "santa-cruz": "Provincia de Santa Cruz",
  "tierra-del-fuego": "Provincia de Tierra del Fuego",
};

const UNIDADES = ["", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez", "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve", "veinte", "veintiuno", "veintidós", "veintitrés", "veinticuatro", "veinticinco", "veintiséis", "veintisiete", "veintiocho", "veintinueve"];
const DECENAS = ["", "", "", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"];
const CENTENAS = ["", "ciento", "doscientos", "trescientos", "cuatrocientos", "quinientos", "seiscientos", "setecientos", "ochocientos", "novecientos"];

function seccionEnLetras(n) {
  if (n === 0) return "";
  if (n < 30) return UNIDADES[n];
  if (n < 100) {
    const d = Math.floor(n / 10), u = n % 10;
    return DECENAS[d] + (u ? " y " + UNIDADES[u] : "");
  }
  if (n === 100) return "cien";
  const c = Math.floor(n / 100), resto = n % 100;
  return CENTENAS[c] + (resto ? " " + seccionEnLetras(resto) : "");
}

function enteroEnLetras(num) {
  if (num === 0) return "cero";
  let palabras = "";
  const millones = Math.floor(num / 1000000);
  const miles = Math.floor((num % 1000000) / 1000);
  const resto = num % 1000;

  if (millones > 0) {
    palabras += millones === 1 ? "un millón" : seccionEnLetras(millones) + " millones";
    palabras += " ";
  }
  if (miles > 0) {
    palabras += miles === 1 ? "mil" : seccionEnLetras(miles) + " mil";
    palabras += " ";
  }
  if (resto > 0) palabras += seccionEnLetras(resto);
  return palabras.trim();
}

function escribirEnLetras(rawValue, isRate = false) {
  if (rawValue === undefined || rawValue === null || rawValue.toString().trim() === "") {
    return "___________";
  }
  let s = rawValue.toString().trim().replace(/\s/g, "");
  if (s.includes(",") && s.includes(".")) {
    s = s.replace(/\./g, "").replace(",", ".");
  } else if (s.includes(",")) {
    s = s.replace(",", ".");
  } else if (/^\d{1,3}(?:\.\d{3})+$/.test(s)) {
    s = s.replace(/\./g, "");
  }
  const num = parseFloat(s);
  if (isNaN(num)) return rawValue.toString();

  const entero = Math.floor(num);
  const centavos = Math.round((num - entero) * 100);

  let resultado = enteroEnLetras(entero);
  if (centavos > 0) {
    resultado += isRate
      ? ' coma ' + String(num).split('.')[1].split('').map((digit) => Number(digit) === 0 ? 'cero' : UNIDADES[Number(digit)]).join(' ')
      : " con " + enteroEnLetras(centavos) + " centavos";
  }
  return resultado.toUpperCase();
}

const MUTUO_CLAUSULA_QUINTA_PESOS = `QUINTA (Moneda de Pago): La obligación asumida por el MUTUARIO se cancelará exclusivamente en moneda de curso legal de la República Argentina, es decir, pesos argentinos, mediante el pago íntegro del Capital, intereses y demás conceptos exigibles conforme al presente contrato.`;

const MUTUO_CLAUSULA_QUINTA_USD = `QUINTA (Moneda de Pago y Renuncia Expresa al Artículo 765 del CCCN): Las partes manifiestan expresamente que la entrega de la moneda extranjera seleccionada ha sido condición determinante y esencial para la celebración de este acto. El MUTUARIO renuncia en forma expresa, incondicional e irrevocable a la facultad de liberación que le concede el artículo 765, segunda parte, del CCCN. Por lo tanto, se obliga a restituir la deuda exclusivamente en la misma especie de DÓLARES ESTADOUNIDENSES billete. Para el supuesto de que existiese una imposibilidad legal absoluta de adquirir dicha divisa, el MUTUARIO deberá entregar la cantidad de pesos argentinos necesarios para, mediante mecanismo legal y financiero, que el MUTUANTE pueda percibir la cantidad neta y originaria de la divisa pactada.`;

const MUTUO_CLAUSULA_SEXTA = `SEXTA: Garantía y Fianza de Tercero Principal Pagador: En el presente acto, el/la sr./sra. {{garantes.g1_nombre_opcional}}, de nacionalidad {{garantes.g1_nacionalidad_opcional}}, de estado civil {{garantes.g1_estado_civil_opcional}}, D.N.I. Nº {{garantes.g1_dni_opcional}}, con C.U.I.T./C.U.I.L. Nº {{garantes.g1_cuit_cuil_opcional}}, con domicilio real en la calle {{garantes.g1_domicilio_calle_opcional}} altura {{garantes.g1_altura_opcional}}, de la localidad de {{garantes.g1_localidad_opcional}}, Provincia de {{garantes.g1_provincia_opcional}}, quien declara constituirse en FIADOR PRINCIPAL PAGADOR de todas las obligaciones nacidas del presente. El fiador asume carácter solidario, liso, llano y de primer grado, renunciando expresamente a los beneficios de excusión, división e interpelación previa (Arts. 1584 y 1589 del CCCN), respondiendo con todo su patrimonio presente y futuro hasta la total y efectiva cancelación del crédito.`;

const MUTUO_CLAUSULA_SEXTA_AUSENCIA = `SEXTA (Ausencia de Fiador): Las partes acuerdan expresamente que el presente contrato se celebra sin la constitución de fiador ni codeudor solidario, siendo el MUTUARIO el único responsable del cumplimiento de las obligaciones asumidas.`;

const MUTUO_CLAUSULA_OCTAVA_COMPLETA = `OCTAVA: (Impuesto de Sellos y Gastos de Instrumentación): Conforme a las normativas de las leyes fiscales locales y códigos tributarios de la provincia donde surta efectos legales el presente instrumento, las partes acuerdan expresamente que el costo del Impuesto de Sellos devengado por la firma de este contrato será soportado exclusivamente por el MUTUANTE. Asimismo, todos los gastos notariales, tasas de certificación de firmas y aranceles derivados de la instrumentación legal del mutuo serán afrontados por el MUTUANTE.`;

const MUTUO_CLAUSULA_OCTAVA_SOLO_SELLOS = `OCTAVA: (Impuesto de Sellos): Conforme a las normativas de las leyes fiscales locales y códigos tributarios de la provincia donde surta efectos legales el presente instrumento, las partes acuerdan expresamente que el costo del Impuesto de Sellos devengado por la firma de este contrato será soportado exclusivamente por el MUTUANTE.`;

const MUTUO_ONEROSO = {
  field_map: {
    "lugar_celebracion_required": ["lugar_celebracion"],
    "provincia_celebracion_required": ["provincia_celebracion"],
    "fecha_celebracion_texto_required": ["fecha_celebracion"],
    "mutuante.nombre_completo_required": ["mutuante_nombre_completo"],
    "mutuante.dni_required": ["mutuante_dni"],
    "mutuante.cuit_cuil_required": ["mutuante_cuit_cuil"],
    "mutuante.estado_civil_required": ["mutuante_estado_civil"],
    "mutuante.calle_required": ["mutuante_calle"],
    "mutuante.altura_required": ["mutuante_altura"],
    "mutuante.localidad_required": ["mutuante_localidad"],
    "mutuante.provincia_required": ["mutuante_provincia"],
    "mutuante.correo_electronico_required": ["mutuante_correo_electronico"],
    "mutuario.nombre_completo_required": ["mutuario_nombre_completo"],
    "mutuario.dni_required": ["mutuario_dni"],
    "mutuario.cuit_cuil_required": ["mutuario_cuit_cuil"],
    "mutuario.estado_civil_required": ["mutuario_estado_civil"],
    "mutuario.calle_required": ["mutuario_calle"],
    "mutuario.altura_required": ["mutuario_altura"],
    "mutuario.localidad_required": ["mutuario_localidad"],
    "mutuario.provincia_required": ["mutuario_provincia"],
    "mutuario.correo_electronico_required": ["mutuario_correo_electronico"],
    "condiciones.monto_capital_numeros_required": ["monto_capital_numeros"],
    "condiciones.moneda_required": ["moneda"],
    "condiciones.metodo_entrega_required": ["metodo_entrega"],
    "condiciones.cbu_cvu_opcional": ["cbu_cvu"],
    "plazos.plazo_meses_required": ["plazo_meses"],
    "plazos.fecha_vencimiento_texto_required": ["fecha_vencimiento"],
    "plazos.cantidad_cuotas_required": ["cantidad_cuotas"],
    "plazos.monto_cuota_numeros_required": ["monto_cuota_numeros"],
    "intereses.compensatorio_mensual_numeros_required": ["interes_compensatorio_mensual_numeros"],
    "intereses.tna_numeros_required": ["tna_numeros"],
    "intereses.moratorio_mensual_numeros_required": ["interes_moratorio_mensual_numeros"],
    "garantes.g1_nombre_opcional": ["garantes.g1_nombre_opcional"],
    "garantes.g1_nacionalidad_opcional": ["garantes.g1_nacionalidad_opcional"],
    "garantes.g1_estado_civil_opcional": ["garantes.g1_estado_civil_opcional"],
    "garantes.g1_dni_opcional": ["garantes.g1_dni_opcional"],
    "garantes.g1_cuit_cuil_opcional": ["garantes.g1_cuit_cuil_opcional"],
    "garantes.g1_domicilio_calle_opcional": ["garantes.g1_domicilio_calle_opcional"],
    "garantes.g1_altura_opcional": ["garantes.g1_altura_opcional"],
    "garantes.g1_localidad_opcional": ["garantes.g1_localidad_opcional"],
    "garantes.g1_provincia_opcional": ["garantes.g1_provincia_opcional"],
  },
  rules: {
    moneda: { pesos: MUTUO_CLAUSULA_QUINTA_PESOS, usd: MUTUO_CLAUSULA_QUINTA_USD },
    garantia: { empty: "hide", present: MUTUO_CLAUSULA_SEXTA },
  },
  blocks: {
    contrato_integro_literal: `CONTRATO DE MUTUO ONEROSO\n\nEn la ciudad de {{lugar_celebracion_required}} , Provincia de {{provincia_celebracion_required}}, a los {{fecha_celebracion_texto_required}} , entre los abajo firmantes comparecen por una parte: el/la Sr./Sra. {{mutuante.nombre_completo_required}} , D.N.I. Nº {{mutuante.dni_required}}, con C.U.I.T./C.U.I.L. Nº {{mutuante.cuit_cuil_required}}, de estado civil {{mutuante.estado_civil_required}}, con domicilio real en la calle {{mutuante.calle_required}} altura {{mutuante.altura_required}}, de la localidad de {{mutuante.localidad_required}} , Provincia de {{mutuante.provincia_required}} , constituyendo domicilio electrónico a los efectos de este acto en el correo {{mutuante.correo_electronico_required}}, en adelante denominado/a como el "MUTUANTE"; y por la otra parte: el/la Sr./Sra. {{mutuario.nombre_completo_required}}, D.N.I. Nº {{mutuario.dni_required}}, con C.U.I.T./C.U.I.L. Nº {{mutuario.cuit_cuil_required}}, de estado civil {{mutuario.estado_civil_required}}, con domicilio real en la calle {{mutuario.calle_required}} altura {{mutuario.altura_required}}, de la localidad de {{mutuario.localidad_required}} , Provincia de {{mutuario.provincia_required}} , constituyendo domicilio electrónico a los efectos de este acto en el correo {{mutuario.correo_electronico_required}}, en adelante denominado/a como el "MUTUARIO". Las Partes, acreditando su identidad y plena capacidad civil para obligarse en los términos de la legislación de la República Argentina, convienen de mutuo acuerdo celebrar el presente CONTRATO DE MUTUO, sujeto a las siguientes cláusulas y condiciones de fondo y forma:\n\nPRIMERA (Objeto, Monto y Perfeccionamiento del Contrato): El MUTUANTE entrega en este acto en propiedad al MUTUARIO, y este acepta de plena conformidad, la cantidad de {{escribir_en_letras(condiciones.monto_capital_numeros_required)}} (\${{condiciones.monto_capital_numeros_required}}) {{condiciones.moneda_required}} , en adelante denominado EL CAPITAL. El MUTUARIO reconoce y declara recibir el Capital mediante {{condiciones.metodo_entrega_required}} (CBU/CVU Nº {{condiciones.cbu_cvu_opcional}}), sirviendo el presente y/o el comprobante bancario correspondiente como formal recibo y suficiente carta de pago. El MUTUARIO declara bajo juramento que posee capacidad patrimonial, económica y financiera suficiente para afrontar íntegramente las obligaciones asumidas en el presente contrato.\n\nSEGUNDA (Plazo de Devolución y Cronograma de Pagos): El MUTUARIO se obliga expresamente a restituir al MUTUANTE la totalidad del Capital prestado, junto con los intereses devengados detallados en la Cláusula Tercera, en el plazo perentorio de {{plazos.plazo_meses_required}} meses, venciendo de forma definitiva, improrrogable y de pleno derecho el día {{plazos.fecha_vencimiento_texto_required}}. El pago se realizará en {{plazos.cantidad_cuotas_required}} cuotas mensuales consecutivas de {{escribir_en_letras(plazos.monto_cuota_numeros_required)}} (\${{plazos.monto_cuota_numeros_required}}) {{condiciones.moneda_required}}, las cuales deberán abonarse del día 1 al 10 de cada mes calendario.\n\nTERCERA (Intereses Compensatorios): Conforme a la presunción de onerosidad dispuesta por el Art. 1527 del CCCN, el Capital devengará a favor del MUTUANTE un interés compensatorio mensual calculado sobre el saldo del {{escribir_en_letras(intereses.compensatorio_mensual_numeros_required)}} por ciento ({{intereses.compensatorio_mensual_numeros_required}}%), el cual equivale a una Tasa Nominal Anual (TNA) del {{escribir_en_letras(intereses.tna_numeros_required)}} por ciento ({{intereses.tna_numeros_required}}%). Los intereses estipulados se liquidarán y pagarán de forma mensual junto con la cuota de amortización.\n\nCUARTA (Mora Automática e Intereses Moratorios y Punitorios): La mora en el cumplimiento de las obligaciones de pago asumidas por el MUTUARIO en este contrato se producirá de pleno derecho por el mero vencimiento de los plazos estipulados, sin necesidad de requerimiento, interpelación, intimación ni notificación judicial o extrajudicial previa alguna (Art. 886 del CCCN). A partir del día inmediato posterior a la configuración de la mora y hasta el efectivo e íntegro pago de las sumas debidas, además del interés compensatorio pactado en la Cláusula Tercera, se devengará en concepto de interés moratorio y punitorio una tasa adicional equivalente al {{escribir_en_letras(intereses.moratorio_mensual_numeros_required)}} por ciento ({{intereses.moratorio_mensual_numeros_required}}%) mensual, la cual operará como cláusula penal en los términos de los Arts. 790 y concordantes del CCCN.\n\n${MUTUO_CLAUSULA_QUINTA_USD}\n\n${MUTUO_CLAUSULA_SEXTA}\n\nSÉPTIMA (Caducidad de Plazos y Vía Ejecutiva Directa): La falta de pago en término de una sola cuota de capital o de intereses facultará al MUTUANTE a declarar de forma unilateral la caducidad anticipada de todos los plazos pendientes del contrato, transformando la totalidad de la deuda en líquida, exigible y de plazo vencido. Las partes reconocen que, una vez certificadas las firmas o reconocidas judicialmente, el presente instrumento podrá ser utilizado como base de acción ejecutiva para el cobro del Capital, intereses y costas en la medida en que la legislación procesal aplicable lo autorice.\n\nOCTAVA: (Impuesto de Sellos y Gastos de Instrumentación): Conforme a las normativas de las leyes fiscales locales y códigos tributarios de la provincia donde surta efectos legales el presente instrumento, las partes acuerdan expresamente que el costo del Impuesto de Sellos devengado por la firma de este contrato será soportado exclusivamente por el MUTUANTE. Asimismo, todos los gastos notariales, tasas de certificación de firmas y aranceles derivados de la instrumentación legal del mutuo serán afrontados por el MUTUANTE.\n\nNOVENA: (Domicilios Constituidos y Jurisdicción Judicial): A todos los efectos civiles, contractuales y procesales derivados del presente contrato, las partes ratifican los domicilios reales, especiales y electrónicos denunciados en el encabezamiento. Se considerarán plenamente válidas, eficaces y vinculantes todas las notificaciones, intimaciones judiciales o extrajudiciales que se remitan a los mismos de acuerdo con los códigos de procedimientos vigentes. Para el caso de suscitarse cualquier controversia que no pueda ser resuelta de mutuo acuerdo, las partes se someten de manera voluntaria y exclusiva a la jurisdicción de los Tribunales Ordinarios en lo Civil y Comercial de la Ciudad de {{lugar_celebracion_required}} , renunciando formalmente a cualquier otro fuero, tribunal o jurisdicción territorial que pudiera corresponderles por ley.\n\nDÉCIMA (lugar y fecha): En prueba de plena conformidad y aceptación de las cláusulas precedentes,se firman dos ejemplares de un mismo tenor y a un solo efecto en la ciudad de {{lugar_celebracion_required}} , el día {{fecha_celebracion_texto_required}}.`,
  },
};

const LOCACION_SERVICIOS_PROFESIONALES = {
  field_map: {
    "prestador.nombre_y_profesion_required": ["prestador_nombre_profesion"],
    "prestador.domicilio_required": ["prestador_domicilio"],
    "cliente.nombre_o_razon_social_required": ["cliente_nombre_razon_social"],
    "cliente.domicilio_required": ["cliente_domicilio"],
    "servicio.descripcion_servicio_required": ["servicio_descripcion"],
    "servicio.tipo_establecimiento_required": ["servicio_tipo_establecimiento"],
    "jurisdiccion.tribunales_required": ["cierre_jurisdiccion"],
  },
  required_inputs: [
    "prestador_nombre_profesion", "prestador_domicilio", "cliente_nombre_razon_social",
    "cliente_domicilio", "servicio_descripcion", "servicio_tipo_establecimiento", "cierre_jurisdiccion",
  ],
  blocks: {
    contrato_integro_literal: `CONTRATO DE LOCACIÓN DE SERVICIOS PROFESIONALES\n\nComparecencia\nEntre {{prestador.nombre_y_profesion_required}}, profesional habilitado con domicilio en {{prestador.domicilio_required}}, en adelante el “Prestador”, y {{cliente.nombre_o_razon_social_required}}, con domicilio especial constituido en {{cliente.domicilio_required}}, en adelante el “Cliente”, se celebra el presente contrato de locación de servicios profesionales, sujeto a las cláusulas que siguen y a lo dispuesto por el Código Civil y Comercial de la Nación.\n\nPrimera. Objeto\nEl Cliente encomienda al Prestador la realización de {{servicio.descripcion_servicio_required}} y demás prestaciones compatibles con el servicio contratado para el {{servicio.tipo_establecimiento_required}} indicado por el Cliente.\n\nSegunda. Modalidad y plazo\nEl servicio se prestará en los días, horarios y turnos que las Partes acuerden por escrito, por un plazo inicial determinado, renovable por acuerdo expreso. Cualquiera de las Partes podrá rescindir el contrato sin expresión de causa mediante notificación fehaciente cursada con una antelación mínima razonable.\n\nTercera. Honorarios y facturación\nLa retribución del Prestador, su base de cálculo, periodicidad, forma de facturación y plazo de pago quedarán definidos en anexo o instrumento complementario reservado. La factura deberá detallar el período, la cantidad de horas o prestaciones realizadas y cualquier otro concepto necesario para la debida auditoría del servicio.\n\nCuarta. Autonomía técnica\nEl Prestador actuará con autonomía técnica, de conformidad con las reglas de su arte, su matrícula y las normas éticas y legales aplicables a su profesión. Si durante la ejecución del contrato surgiera alguna incompatibilidad legal, técnica o de salud que afecte el adecuado cumplimiento del servicio, deberá comunicarla al Cliente en forma inmediata.\n\nQuinta. Naturaleza de la relación\nLas Partes dejan expresa constancia de que este contrato no importa relación de dependencia. El Prestador conservará su autonomía organizativa, técnica y económica, siendo responsable por sus propias obligaciones profesionales, fiscales y previsionales.\n\nSexta. No exclusividad\nSalvo pacto expreso en contrario, el Prestador podrá desarrollar actividades para terceros, siempre que ello no genere conflicto de intereses ni afecte el cumplimiento oportuno y diligente de las prestaciones asumidas frente al Cliente.\n\nSéptima. Confidencialidad\nToda información a la que el Prestador acceda con motivo del presente tendrá carácter confidencial. No podrá divulgarla ni utilizarla para finalidades ajenas a la ejecución del contrato sin autorización escrita del Cliente, subsistiendo este deber aun después de finalizada la relación contractual.\n\nOctava. Gastos, tributos y documentación\nCada Parte afrontará las cargas, tributos y gastos que legalmente le correspondan. Los costos extraordinarios o reintegrables deberán contar con autorización previa y respaldo documental suficiente.\n\nNovena. Jurisdicción y domicilios\nLas Partes constituyen domicilios especiales en los denunciados al encabezamiento y se someten a la jurisdicción de los tribunales ordinarios de {{jurisdiccion.tribunales_required}} para toda controversia derivada del presente.`,
  },
};

const CONVENIO_CONFIDENCIALIDAD = {
  field_map: {
    "parte_a.nombre_o_razon_social_required": ["parte_a_nombre_razon_social"],
    "parte_a.domicilio_required": ["parte_a_domicilio"],
    "parte_b.nombre_o_razon_social_required": ["parte_b_nombre_razon_social"],
    "parte_b.domicilio_required": ["parte_b_domicilio"],
    "jurisdiccion.tribunales_required": ["jurisdiccion_tribunales"],
  },
  required_inputs: ["parte_a_nombre_razon_social", "parte_a_domicilio", "parte_b_nombre_razon_social", "parte_b_domicilio", "jurisdiccion_tribunales"],
  blocks: {
    contrato_integro_literal: `CONVENIO DE CONFIDENCIALIDAD\n\nComparecencia\nEntre {{parte_a.nombre_o_razon_social_required}}, con domicilio constituido en {{parte_a.domicilio_required}}, y {{parte_b.nombre_o_razon_social_required}}, con domicilio constituido en {{parte_b.domicilio_required}}, en adelante conjuntamente las “Partes”, se celebra el presente convenio de confidencialidad.\n\nPrimero. Objeto\nLas Partes manifiestan su interés en evaluar una eventual operación comercial y/o societaria vinculada con una unidad de negocio determinada (el “Proyecto”). Con motivo de dicho análisis podrán intercambiar información técnica, comercial, legal, financiera, operativa y de cualquier otra naturaleza que deba ser tratada con carácter reservado.\n\nSegundo. Información confidencial\nSe entiende por “Información Confidencial” toda información, documento, dato, registro, proyección, informe, contrato, antecedente, comunicación o material, cualquiera sea su soporte, vinculado directa o indirectamente con la Parte que lo suministra, con el Proyecto o con las negociaciones mantenidas entre las Partes.\nNo se considerará confidencial la información que la Parte receptora acredite fehacientemente: (a) que era de dominio público al momento de su revelación; (b) que pasó a ser pública sin violación del presente convenio; (c) que ya obraba legítimamente en su poder sin deber de reserva; o (d) que fue suministrada por un tercero legitimado para hacerlo.\n\nTercero. Obligaciones de la parte receptora\nLa Parte receptora se obliga a: (i) utilizar la Información Confidencial exclusivamente para evaluar el Proyecto; (ii) abstenerse de divulgarla a terceros sin autorización previa y escrita de la Parte reveladora; (iii) limitar su acceso a aquellos directivos, empleados, asesores o representantes que razonablemente necesiten conocerla; y (iv) adoptar medidas de resguardo no inferiores a las que emplea para proteger su propia información sensible.\n\nCuarto. Divulgación exigida por autoridad competente\nSi una Parte recibiera un requerimiento válido emanado de autoridad judicial, administrativa o regulatoria competente que la obligare a revelar Información Confidencial, deberá notificar a la otra Parte con la mayor antelación posible permitida por la normativa aplicable, a fin de que ésta pueda adoptar las medidas que estime pertinentes.\n\nQuinto. No obligación de contratar\nEl presente convenio no obliga a las Partes a celebrar la operación analizada ni a continuar negociaciones. Tampoco podrá interpretarse como oferta, aceptación, promesa de contratar, exclusividad ni reconocimiento de derecho alguno sobre el Proyecto o los activos involucrados.\n\nSexto. Devolución o destrucción\nA requerimiento de la Parte reveladora, la Parte receptora deberá restituir o destruir la Información Confidencial recibida, salvo aquella cuya conservación resulte exigida por ley, regulación aplicable o políticas internas de archivo debidamente justificadas.\n\nSéptimo. Vigencia\nLas obligaciones de confidencialidad permanecerán vigentes durante el plazo que acuerden las Partes y, en su defecto, por el término razonable que resulte compatible con la naturaleza de la información compartida y con el Proyecto evaluado.\n\nOctavo. Ley aplicable y jurisdicción\nEl presente convenio se regirá por las leyes de la República Argentina. Para toda controversia derivada de su interpretación, validez, ejecución o terminación, las Partes se someten a la jurisdicción de los tribunales ordinarios con competencia comercial de {{jurisdiccion.tribunales_required}}, salvo que acuerden por escrito otro foro competente.`,
  },
};

let commercialV9Template;
let viviendaV9Template;
let temporariaV9Template;

function getV9Template(document) {
  const field_map = {};
  const required_inputs = [];
  Object.entries(document.input_schema).forEach(([section, fields]) => {
    Object.keys(fields).forEach((key) => {
      const flatKey = key.endsWith("_letras_required")
        ? `${section}_${key.replace("_letras_required", "_numeros")}`
        : `${section}_${key.replace(/_(required|optional|opcional)$/, "")}`;
      field_map[`${section}.${key}`] = [flatKey];
      if (key.endsWith("_required")) required_inputs.push(flatKey);
    });
  });
  const templateText = document.template_blocks.contrato_integro_literal;
  return {
    field_map,
    required_inputs,
    blocks: { contrato_integro_literal: templateText },
    template_text: templateText,
  };
}

function getCommercialV9Template() {
  if (!commercialV9Template) commercialV9Template = getV9Template(comercialV9Json);
  return commercialV9Template;
}

function getViviendaV9Template() {
  if (!viviendaV9Template) {
    const template = getV9Template(viviendaV9Json);
    let text = template.template_text
      .replace(/\n\s*[1-5]\s*(?=\n|$)/g, "")
      .replace(", nacido el {{locatario.fecha_nacimiento_required}}", "")
      .replace("SEGUNDA (descripción): La UNIDAD LOCADA está compuesta por {{inmueble.cantidad_habitaciones_required}} habitaciones, especificamente {{inmueble.habitaciones_detalle_required}}.", "SEGUNDA (descripción): La UNIDAD LOCADA está compuesta por {{inmueble.habitaciones_detalle_required}}.")
      .replace("DECIMO CUARTA (depósito en garantía)", "DECIMO QUINTA (depósito en garantía)")
      .replace("DECIMO QUINTA (garantes)", "DECIMO SEXTA (garantes)")
      .replace("DECIMO SEXTA (restitución del inmueble)", "DECIMO SEPTIMA (restitución del inmueble)")
      .replace("DECIMO SEPTIMA (domicilios y Jurisdicción)", "DECIMO OCTAVA (domicilios y Jurisdicción)")
      .replace("DECIMO OCTAVA (domicilio electrónico)", "DECIMO NOVENA (domicilio electrónico)")
      .replace("DECIMO NOVENA (firmas e instrumentación)", "VIGÉSIMA (firmas e instrumentación)")
      .replace("VIGECIMO (lugar y fecha)", "VIGÉSIMA PRIMERA (lugar y fecha)")
      .replace("Tribunales Ordinarios de {{cierre.centro_judicial_required}}", "tribunales ordinarios legalmente competentes")
      .replace("{{cierre.cantidad_ejemplares_letras_required}} ({{cierre.cantidad_ejemplares_numeros_required}}) ejemplares", "dos (2) ejemplares")
      .replace(/VIGÉSIMA PRIMERA \(lugar y fecha\):[\s\S]*$/, "VIGÉSIMA PRIMERA (lugar y fecha): El presente contrato se celebra el {{cierre.fecha_firma_required}}.");
    const field_map = { ...template.field_map, "cierre.fecha_firma_required": ["cierre_fecha_firma"] };
    ["locatario.fecha_nacimiento_required", "cierre.centro_judicial_required", "cierre.cantidad_ejemplares_letras_required", "cierre.cantidad_ejemplares_numeros_required", "cierre.ciudad_firma_required", "cierre.departamento_firma_required", "cierre.provincia_firma_required", "cierre.dia_firma_required", "cierre.mes_firma_required", "cierre.ano_firma_required"].forEach((key) => delete field_map[key]);
    [1, 2].forEach((number) => ["nombre", "dni", "cuit_cuil", "nacionalidad", "estado_civil", "domicilio_calle", "ciudad", "departamento", "provincia", "correo_electronico"].forEach((field) => {
      field_map[`garantes.g${number}_${field}_opcional`] = [`garantes_g${number}_${field}`];
    }));
    viviendaV9Template = { ...template, field_map, template_text: text, blocks: { contrato_integro_literal: text } };
  }
  return viviendaV9Template;
}

function getTemporariaV9Template() {
  if (!temporariaV9Template) temporariaV9Template = getV9Template(temporariaV9Json);
  return temporariaV9Template;
}

const STRICT_TEMPLATES = {
  "mutuo-oneroso": { ...MUTUO_ONEROSO, template_text: MUTUO_ONEROSO.blocks.contrato_integro_literal },
  "locacion-servicios-profesionales": { ...LOCACION_SERVICIOS_PROFESIONALES, template_text: LOCACION_SERVICIOS_PROFESIONALES.blocks.contrato_integro_literal },
  "convenio-confidencialidad": { ...CONVENIO_CONFIDENCIALIDAD, template_text: CONVENIO_CONFIDENCIALIDAD.blocks.contrato_integro_literal },
};

function nestedValue(source, path) {
  return path.split(".").reduce((value, part) => value?.[part], source);
}

function resolveValue(key, formData, fieldMap) {
  const direct = nestedValue(formData, key);
  if (direct !== undefined && direct !== null && String(direct).trim() !== "") return String(direct);
  for (const inputName of fieldMap[key] || []) {
    const value = nestedValue(formData, inputName);
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return key.endsWith("_letras_required") ? escribirEnLetras(value) : String(value);
    }
  }
  return null;
}

function missingRequiredFields(template, formData) {
  const requiredKeys = Object.keys(template.field_map).filter((key) => key.endsWith("_required"));
  return requiredKeys.filter((key) => resolveValue(key, formData, template.field_map) === null);
}

const TITLE_PARTICLES = new Set(["de", "del", "da", "di", "la", "las", "los", "van", "y", "e"]);
const NAME_FIELDS = new Set(["nombre_completo", "nombre", "nombre_y_profesion", "nombre_o_razon_social"]);
const TOPONYM_FIELDS = new Set(["ciudad", "localidad", "calle", "provincia", "nacionalidad", "departamento", "departamento_partido", "domicilio_calle", "ciudad_firma", "departamento_firma", "provincia_firma", "centro_judicial", "tribunales", "ciudad_inmueble", "departamento_inmueble", "provincia_inmueble", "localidad_inmueble", "domicilio_inmueble", "lugar_celebracion", "provincia_celebracion", "jurisdiccion", "ciudad_partido"]);

function capitalizeFirst(value) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function capitalizeTitle(value) {
  if (!value) return value;
  return value.split(" ").map((word, i) => {
    const lower = word.toLowerCase();
    if (i > 0 && TITLE_PARTICLES.has(lower)) return lower;
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(" ");
}

function getCapitalizationStyle(key) {
  const fieldPart = key.split(".").pop().replace(/_(required|opcional)$/, "").toLowerCase();
  if (NAME_FIELDS.has(fieldPart) || /^g\d+_nombre$/.test(fieldPart)) return "first";
  if (TOPONYM_FIELDS.has(fieldPart)) return "title";
  return null;
}

function interpolate(template, formData, fieldMap) {
  return template.replace(/\{\{\s*(escribir_en_letras\()?\s*([\w.]+)\s*\)?\s*\}\}/g, (_match, letters, key) => {
    const value = resolveValue(key, formData, fieldMap);
    if (!letters && value === null && key.endsWith("_otro_opcional")) return "";
    if (letters) return escribirEnLetras(value, /interes|porcentaje|tna|tasa|moratorio|compensatorio/i.test(key));
    const result = value ?? "___________";
    if (result === "___________") return result;
    const style = getCapitalizationStyle(key);
    if (style === "first") return capitalizeFirst(result);
    if (style === "title") return capitalizeTitle(result);
    return result;
  });
}

export async function buildStrictContract(slug, formData) {
  const template = slug === "locacion-comercial"
    ? getCommercialV9Template()
    : slug === "locacion-vivienda"
      ? getViviendaV9Template()
      : slug === "locacion-temporaria-turistica"
        ? getTemporariaV9Template()
        : STRICT_TEMPLATES[slug];
  if (!template) return null;

  if (slug === "locacion-vivienda") {
    const environmentLabels = [
      ["inmueble_cantidad_dormitorios", "dormitorio", "dormitorios"],
      ["inmueble_cantidad_banos", "baño", "baños"],
      ["inmueble_cantidad_cocinas", "cocina", "cocinas"],
      ["inmueble_cantidad_living_comedor", "living-comedor", "living-comedor"],
      ["inmueble_cantidad_balcones", "balcón", "balcones"],
    ];
    const detail = environmentLabels.map(([key, singular, plural]) => {
      const value = formData[key];
      if (!value || value === "No tiene") return "";
      return `${value} ${String(value) === "1" ? singular : plural}`;
    }).filter(Boolean).join(", ") || "sin ambientes detallados";
    formData = { ...formData, inmueble_habitaciones_detalle: detail };
  }

  let templateText = template.template_text;
  if (slug === "mutuo-oneroso") {
    const moneda = String(formData.moneda || "").trim().toLowerCase();
    const isPesos = moneda.includes("peso");
    templateText = templateText.replace(MUTUO_CLAUSULA_QUINTA_USD, isPesos ? MUTUO_CLAUSULA_QUINTA_PESOS : MUTUO_CLAUSULA_QUINTA_USD);
    const metodoEntrega = String(formData.metodo_entrega || "").trim().toLowerCase();
    if (metodoEntrega.includes("efectivo")) {
      templateText = templateText.replace(
        "mediante {{condiciones.metodo_entrega_required}} (CBU/CVU Nº {{condiciones.cbu_cvu_opcional}}), sirviendo el presente y/o el comprobante bancario correspondiente como formal recibo y suficiente carta de pago.",
        "mediante efectivo, sirviendo el presente como formal recibo y suficiente carta de pago."
      );
    }
    if (String(formData.incluir_fiador || "").trim() !== "Sí") {
      templateText = templateText.replace(MUTUO_CLAUSULA_SEXTA, MUTUO_CLAUSULA_SEXTA_AUSENCIA);
    }
    if (!/sí|si/i.test(String(formData.certificar_firmas_escribano || "").trim())) {
      templateText = templateText.replace(MUTUO_CLAUSULA_OCTAVA_COMPLETA, MUTUO_CLAUSULA_OCTAVA_SOLO_SELLOS);
    }
  }

  const conditionalMissing = [];
  if (slug === "locacion-vivienda" && ["1", "2"].includes(String(formData.garantes_cantidad))) {
    const count = Number(formData.garantes_cantidad);
    for (let number = 1; number <= count; number += 1) {
      ["nombre", "dni", "cuit_cuil", "nacionalidad", "estado_civil", "domicilio_calle", "ciudad", "departamento", "provincia", "correo_electronico"].forEach((field) => {
        const key = `garantes.g${number}_${field}_opcional`;
        if (resolveValue(key, formData, template.field_map) === null) conditionalMissing.push(key);
      });
    }
  }

  const rawGeneratedText = interpolate(templateText, formData, template.field_map);
  const titleIsCentered = rawGeneratedText.startsWith("[CENTRAR]");
  const generated_text = rawGeneratedText.replace(/^\[CENTRAR\]/, "");
  const document_blocks = generated_text.split(/\n\s*\n+/).filter(Boolean).map((content, index) => ({
    type: index === 0 && (titleIsCentered || (content.trim().length < 100 && content.trim() === content.trim().toUpperCase() && /[A-ZÁÉÍÓÚÑ]/.test(content))) ? "title" : "paragraph",
    content,
  }));

  return { generated_text, document_blocks, missing_fields: [...missingRequiredFields(template, formData), ...conditionalMissing], field_map: template.field_map };
}
