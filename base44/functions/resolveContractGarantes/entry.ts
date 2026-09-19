import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ── Motor de Procesamiento Legal Estricto ──
// Ensambla el contrato de locación de inmueble de forma determinista.
// Zero-hallucination: no agrega, omite, resume ni parafrasea ninguna palabra.

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const base44 = createClientFromRequest(req);

    const { event, data } = body;
    if (!event || event.type !== 'create') {
      return Response.json({ skipped: true, reason: 'not a create event' });
    }

    if (!data || data.template_id !== 'locacion-vivienda') {
      return Response.json({ skipped: true, reason: 'not locacion-vivienda' });
    }

    const contractId = event.entity_id;
    const fd = data.form_data || {};

    // ── VALIDACIÓN ESTRICTA ──
    const requiredFields = [
      'locador_nombre', 'locador_dni', 'locador_cuil_t', 'locador_correo',
      'locador_fecha_nac_nacionalidad', 'locador_estado_civil', 'locador_calle',
      'locador_ciudad', 'locador_departamento', 'locador_provincia',
      'locatario_nombre', 'locatario_dni', 'locatario_cuil_t', 'locatario_correo',
      'locatario_fecha_nac', 'locatario_nacionalidad', 'locatario_estado_civil',
      'locatario_calle', 'locatario_ciudad', 'locatario_departamento', 'locatario_provincia',
      'inmueble_calle', 'inmueble_numeracion', 'inmueble_ciudad',
      'inmueble_departamento', 'inmueble_provincia',
      'inmueble_habitaciones_total', 'inmueble_dormitorios', 'inmueble_banos',
      'inmueble_living', 'inmueble_cocina',
      'condiciones_meses_plazo', 'condiciones_anos_plazo',
      'condiciones_fecha_inicio', 'condiciones_fecha_fin',
      'condiciones_precio_letras', 'condiciones_precio_numeros',
      'condiciones_periodo_inicial', 'condiciones_periodo_incremento',
      'condiciones_indice_incremento',
      'condiciones_interes_mora_numeros', 'condiciones_interes_mora_letras',
      'condiciones_servicios_cargo_locatario',
      'condiciones_deposito_letras', 'condiciones_deposito_numeros',
      'garantia_tipo',
      'cierre_centro_judicial', 'cierre_ejemplares_letras', 'cierre_ejemplares_numeros',
      'cierre_ciudad_firma', 'cierre_departamento_firma', 'cierre_provincia_firma',
      'cierre_dia_firma', 'cierre_mes_firma', 'cierre_ano_firma',
    ];

    for (const field of requiredFields) {
      const val = fd[field];
      if (val === undefined || val === null || val.toString().trim() === '') {
        // Log validation error but don't block - the contract was already created
        console.warn('Validation warning: missing field ' + field);
      }
    }

    // Helper: get value or blank placeholder
    const v = (key) => {
      const val = fd[key];
      if (val !== undefined && val !== null && val.toString().trim() !== '') return val.toString();
      return '___________';
    };

    // ── RENDERIZADO CONDICIONAL: CLÁUSULA 15 (GARANTES) ──
    const tipoGarantia = fd.garantia_tipo || 'sin garantes';
    let clausula15 = '';

    if (tipoGarantia === 'sin garantes') {
      clausula15 = 'DECIMO QUINTA (garantes): Las partes acuerdan que el presente contrato se celebra sin la constitución de garantes ni fiadores.';
    } else {
      const g1 = buildGaranteText(fd, 'garante_1');
      const g2 = buildGaranteText(fd, 'garante_2');

      let garanatesIntro = '';
      if (g1 && g2) {
        garanatesIntro = 'Entre ' + g1 + ', y ' + g2;
      } else if (g1) {
        garanatesIntro = 'Entre ' + g1;
      } else {
        // Fallback if "con garantes" selected but no garante data filled
        garanatesIntro = '';
      }

      if (garanatesIntro) {
        clausula15 = 'DECIMO QUINTA (garantes): ' + garanatesIntro + ', se interiorizan del presente contrato de locación, y se constituyen en codeudores lisos, llanos y principales pagadores de todas las obligaciones emergentes de este contrato, en adelante denominados LOS GARANTES, renunciando al beneficio de división previa excusión, obligándose también al pago de todos los gastos y costos de demandas judiciales que se iniciaren con motivo del incumplimiento del presente instrumento, conviniéndose expresamente que estas obligaciones que contraen subsistirán aún después de vencido el plazo de locación, y hasta que la PARTE LOCATARIA entregue el inmueble completamente desocupado, a entera satisfacción de la PARTE LOCADORA, y no existan obligaciones pendientes. La obligación de codeudores solidarios se extiende a sus sucesores. En caso de insolvencia o cualquier motivo, o su ausencia, la PARTE LOCATARIA se obliga a ofrecer otro en su reemplazo, que sea de reconocida solvencia y a satisfacción de la PARTE LOCADORA, dentro del plazo perentorio de treinta (30) días corridos, si así no lo hiciere la PARTE LOCADORA se reserva el derecho de pedir la rescisión de este contrato y obligar a la PARTE LOCATARIA a desocupar el inmueble en las condiciones convenidas.';
      } else {
        clausula15 = 'DECIMO QUINTA (garantes): Las partes acuerdan que el presente contrato se celebra sin la constitución de garantes ni fiadores.';
      }
    }

    // ── ENSAMBLADO ESTRICTO DEL CONTRATO ──
    // Cada bloque es texto inmutable. Solo se inyectan variables y se resuelven condicionales.

    const blocks = [];

    // ENCABEZADO
    blocks.push('CONTRATO DE LOCACIÓN DE INMUEBLE');
    blocks.push('Entre ' + v('locador_nombre') + ', D.N.I. nro. ' + v('locador_dni') + ', CUIL/T nro. ' + v('locador_cuil_t') + ', correo electrónico ' + v('locador_correo') + ', nacido el ' + v('locador_fecha_nac_nacionalidad') + ', mayor de edad, de estado civil ' + v('locador_estado_civil') + ', domiciliada en calle ' + v('locador_calle') + ', de la ciudad de ' + v('locador_ciudad') + ', Departamento/partido de ' + v('locador_departamento') + ' de la provincia de ' + v('locador_provincia') + ', por una parte y en adelante la PARTE LOCADORA y por la otra parte ' + v('locatario_nombre') + ', D.N.I. nro. ' + v('locatario_dni') + ', CUIL/T nro. ' + v('locatario_cuil_t') + ', correo electrónico ' + v('locatario_correo') + ', nacido el ' + v('locatario_fecha_nac') + ', de estado civil ' + v('locatario_estado_civil') + ', ' + v('locatario_nacionalidad') + ', mayor de edad, domiciliado en calle ' + v('locatario_calle') + ' de la ciudad de ' + v('locatario_ciudad') + ', Departamento/partido de ' + v('locatario_departamento') + ' de la provincia de ' + v('locatario_provincia') + ', en adelante la PARTE LOCATARIA, convienen en celebrar el siguiente CONTRATO DE LOCACIÓN sujeto a las cláusulas y condiciones que siguen:');

    // CLÁUSULA 1
    blocks.push('PRIMERA (Objeto): La PARTE LOCADORA cede el uso y goce a título de LOCACIÓN a favor de la PARTE LOCATARIA una Unidad Funcional a sito en calle ' + v('inmueble_calle') + ' número ' + v('inmueble_numeracion') + ', Piso/Departamento ' + v('inmueble_piso_depto') + ', nomenclatura catastral ' + v('inmueble_nomenclatura_catastral') + ', partida inmobiliaria ' + v('inmueble_partida_inmobiliaria') + ' ,en adelante denominada UNIDAD LOCADA de la ciudad de ' + v('inmueble_ciudad') + ', Departamento/partido de ' + v('inmueble_departamento') + ', Provincia de ' + v('inmueble_provincia') + '.');

    // CLÁUSULA 2
    blocks.push('SEGUNDA (descripción): La UNIDAD LOCADA está compuesta por ' + v('inmueble_habitaciones_total') + ' habitaciones, especificamente ' + v('inmueble_dormitorios') + ', ' + v('inmueble_banos') + ', ' + v('inmueble_living') + ', ' + v('inmueble_cocina') + ', ' + v('inmueble_espacio_libre') + '. Al presente contrato se encuentra anexo un inventario titulado "ANEXO I- inventario" donde se encuentran individualizadas cada una de las habitaciones, las condiciones generales de cada una de ellas a la fecha de la celebración de este contrato, y los bienes muebles que se encuentran en cada una de ellas. La PARTE LOCATARIA lo recibe de conformidad y en buen estado aparente de conservación y funcionamiento, de uso y habitabilidad, obligándose a devolverlo al fin del contrato en igual forma y condiciones, salvo deterioros derivados del uso regular y antigüedad.');

    // CLÁUSULA 3
    blocks.push('TERCERA: (plazo): El plazo de la locación se fija en ' + v('condiciones_meses_plazo') + ' meses, es decir, ' + v('condiciones_anos_plazo') + ' años, comenzando a regir a partir del ' + v('condiciones_fecha_inicio') + ', venciendo en consecuencia el día ' + v('condiciones_fecha_fin') + ', sin necesidad de notificación alguna, fecha en que deberá ser devuelta la UNIDAD LOCADA, libre de ocupantes a la PARTE LOCADORA.');

    // CLÁUSULA 4
    blocks.push('CUARTA (destino): LA UNIDAD LOCADA será destinada únicamente a vivienda familiar de la PARTE LOCATARIA y su grupo familiar, el que no podrá ser alterado durante la vigencia del contrato, sin conformidad previa y emanada por escrito de la PARTE LOCADORA. El cambio o variación de este destino será considerado causa de resolución del contrato, con derecho para la PARTE LOCADORA de solicitar el desalojo del inmueble, con los daños y perjuicios pertinentes.');

    // CLÁUSULA 5
    blocks.push('QUINTA (precio): El alquiler mensual será de PESOS ARGENTINOS ' + v('condiciones_precio_letras') + ' ($' + v('condiciones_precio_numeros') + '), durante el primer ' + v('condiciones_periodo_inicial') + ' de CONTRATO. Entre las partes de común acuerdo establecen que el incremento será de forma ' + v('condiciones_periodo_incremento') + ' conforme al siguiente índice: ' + v('condiciones_indice_incremento') + '. La actualización será automática y no requerirá notificación previa.');

    // CLÁUSULA 6
    blocks.push('SEXTA (periodo y lugar de pago): La PARTE LOCATARIA deberá pagar el alquiler en el domicilio de la PARTE LOCADORA, o donde ésta indique fehacientemente, por mes completo y adelantado, entre los días 1º y el 10 de cada mes como término de gracia.');

    // CLÁUSULA 7
    blocks.push('SEPTIMA (intereses): La falta de pago del alquiler en tiempo y forma hará incurrir a la PARTE LOCATARIA en mora automática, pactándose un interés mensual del ' + v('condiciones_interes_mora_numeros') + '% (' + v('condiciones_interes_mora_letras') + ') desde el primer día de atraso, es decir desde el segundo día de cada mes. En el supuesto que la PARTE LOCATARIA cancele el pago del alquiler hasta el décimo día de cada mes, la PARTE LOCADORA se obliga en forma irrevocable a condonar los intereses que se hubiesen generado por dicho período locativo. Es decir que, si LOS LOCATARIOS pagan el alquiler hasta el décimo día, no deberán intereses por ese periodo, mientras que, si lo cancelan luego del décimo día deberán los intereses devengados a partir del segundo día de ese mes.');

    // CLÁUSULA 8
    blocks.push('OCTAVA (tasas y Servicios): Está a cargo del la PARTE LOCATARIA el pago de ' + v('condiciones_servicios_cargo_locatario') + '. deberá entregar las boletas con las constancias de su pago a la PARTE LOCADORA al finalizar el contrato.');

    // CLÁUSULA 9
    blocks.push('NOVENA (resolución anticipada): la PARTE LOCATARIA tiene derecho a rescindir el presente contrato después de transcurridos los seis primeros meses de vigencia, de acuerdo a la facultad especialmente establecida en el artículo 1221 de CC&C y CN, sin perjuicio de la indemnización correspondiente en favor de la PARTE LOCADORA según lo dispone el artículo 1221 de CC&C . La PARTE LOCATARIA deberá notificar su decisión fehacientemente y por escrito a la PARTE LOCADORA con UN (1) MES de anticipación.');

    // CLÁUSULA 10
    blocks.push('DECIMA (estado del inmueble y declaración de la locataria): La UNIDAD LOCADA, objeto de este instrumento, se encuentra en buen estado aparente de habitabilidad y funcionamiento. La PARTE LOCATARIA declara haber visitado personalmente el inmueble objeto de la presente locación y se obliga a restituir el inmueble al finalizar el presente contrato en las mismas y/o mejores condiciones en que lo recibe, salvo deterioros derivados del uso regular y antigüedad.');

    // CLÁUSULA 11
    blocks.push('DECIMO PRIMERA (mejoras y Conservación del inmueble): 1. MEJORAS DEL INMUEBLE: Pactando las partes que las mejoras que se realicen en el inmueble quedarán en beneficio de éste sin que la PARTE LOCADORA tenga que restituir suma alguna por este concepto. 2. CONSERVACION DEL INMUEBLE y/o MUEBLES: Es a cargo de la PARTE LOCATARIA la conservación del inmueble objeto de la presente locación, en las condiciones que lo recibió, como así también las instalaciones que se encuentran en el mismo. Esta deberá efectuar todas las reparaciones necesarias derivadas del uso ordinario del inmueble para que el inmueble y sus instalaciones resulten adecuadas al destino de la locación, desde la iniciación del presente contrato y hasta que la PARTE LOCADORA lo reciba de conformidad, hecho este, que se producirá cuando la PARTE LOCATARIA haya cumplido todas las obligaciones a su cargo. La PARTE LOCADORA estará a cargo de las reparaciones estructurales, vicios ocultos y deterioros no imputables al uso normal del inmueble.');

    // CLÁUSULA 12
    blocks.push('DECIMO SEGUNDA (inspección): la PARTE LOCADORA y/o la inmobiliaria se reservan el derecho de inspeccionar el inmueble en forma periódica, previo aviso razonable a la PARTE LOCATARIA, debiendo la PARTE LOCATARIA comunicarle cualquier daño o desperfecto que se produzca en el mismo dentro de las cuarenta y ocho (48hs.) horas de ocurrido.');

    // CLÁUSULA 13
    blocks.push('DECIMO TERCERA (eximición de responsabilidad de la PARTE LOCADORA): La PARTE LOCADORA no responderá por daños derivados del uso indebido del inmueble, hechos de terceros o caso fortuito, salvo supuestos legalmente atribuibles a su responsabilidad.');

    // CLÁUSULA 14a
    blocks.push('DECIMO CUARTA (prohibición de Ceder): Queda expresamente prohibido ceder el presente contrato de locación, permutar, transferir, subarrendar o prestar total o parcialmente la propiedad, objeto de la presente. La violación de estas prohibiciones dará lugar a la rescisión culposa del contrato y al desalojo correspondiente, además del pago de daños y perjuicios que resulten.');

    // CLÁUSULA 14b
    blocks.push('DECIMO CUARTA (depósito en garantía): En garantía de las obligaciones contraídas mediante este contrato, la PARTE LOCATARIA da en depósito a la PARTE LOCADORA la suma de Pesos ' + v('condiciones_deposito_letras') + ' ($ ' + v('condiciones_deposito_numeros') + ') Este importe no podrá computarse a pagos de alquileres atrasados o vigentes, penalidades, cargas u obligaciones debidas por aquel, con la salvedad de lo que a continuación se conviene. Es en calidad de depósito de garantía y responde en parte o totalmente a los desperfectos, daños o roturas originadas en la propiedad, sus artefactos o accesorios, y que la PARTE LOCADORA observe cuando la PARTE LOCATARIA al finalizar la locación, siempre y cuando de fiel cumplimiento a todas las obligaciones contraídas mediante este contrato, y restituye al inmueble y sus accesorios al término del presente a entera conformidad de la PARTE LOCADORA. Caso contrario dicha suma quedará en poder de esta y sin perjuicio de iniciar acciones judiciales por mayor monto en caso de ser necesaria.');

    // CLÁUSULA 15 (condicional)
    blocks.push(clausula15);

    // CLÁUSULA 16
    blocks.push('DECIMO SEXTA (restitución del inmueble): La restitución del inmueble solo se tendrá por perfeccionada con la entrega material de todas las llaves.');

    // CLÁUSULA 17
    blocks.push('DECIMO SEPTIMA (domicilios y Jurisdicción): Para todos los efectos, tanto legales como judiciales o extrajudiciales, que se deriven de este contrato las partes se someten a la jurisdicción de los Tribunales Ordinarios de ' + v('cierre_centro_judicial') + ' siempre que resulte legalmente competente, siendo validas las notificaciones que se realicen en los domicilios indicados en el encabezamiento del presente contrato. Las partes contratantes hacen expresa renuncia al Fuero Federal y constituyen domicilios especiales para todos los efectos legales, judiciales o extrajudiciales los que se enuncian en este instrumento.');

    // CLÁUSULA 18
    blocks.push('DECIMO OCTAVA (domicilio electrónico): Las partes constituyen como domicilios electrónicos válidos los correos electrónicos denunciados en el presente contrato.');

    // CLÁUSULA 19
    blocks.push('DECIMO NOVENA (firmas e instrumentación): 1. Se suscriben ' + v('cierre_ejemplares_letras') + ' (' + v('cierre_ejemplares_numeros') + ') ejemplares iguales de este CONTRATO, a un solo efecto. 2. En este mismo acto, la PARTE LOCATARIA recibe las llaves y la tenencia de la UNIDAD LOCADA.');

    // CLÁUSULA 20
    blocks.push('VIGECIMO (lugar y fecha): Celebrado en la Ciudad de ' + v('cierre_ciudad_firma') + ', departamento/partido de ' + v('cierre_departamento_firma') + ', en la provincia de ' + v('cierre_provincia_firma') + ' a los días ' + v('cierre_dia_firma') + ' de ' + v('cierre_mes_firma') + ' del año ' + v('cierre_ano_firma') + '.');

    // ── SALIDA FINAL ──
    const contractText = blocks.join('\n\n');

    // Upload the assembled text
    const uploadResult = await base44.asServiceRole.integrations.Core.UploadFile({
      file: new File([contractText], 'contract.txt', { type: 'text/plain' })
    });

    // Update the contract with the deterministic text
    await base44.asServiceRole.entities.GeneratedContract.update(contractId, {
      generated_text: uploadResult.file_url,
    });

    return Response.json({ success: true, contractId, tipoGarantia });

  } catch (error) {
    console.error('resolveContractGarantes error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function buildGaranteText(fd, prefix) {
  const nombre = fd[prefix + '_nombre'];
  if (!nombre || nombre.toString().trim() === '') return null;

  const g = (field) => {
    const val = fd[prefix + '_' + field];
    return (val && val.toString().trim() !== '') ? val.toString() : '___________';
  };

  let text = nombre + ', D.N.I. N° ' + g('dni') + ', C.U.I.L./C.U.I.T. N° ' + g('cuil_t') + ', ' + g('nacionalidad') + ', mayor de edad, ' + g('estado_civil') + ', con domicilio en calle ' + g('calle');
  
  const barrio = fd[prefix + '_barrio'];
  if (barrio && barrio.toString().trim() !== '') {
    text += ', Barrio ' + barrio;
  }
  
  text += ',' + g('ciudad') + ', ' + g('departamento') + ', ' + g('provincia') + ', C.P. ' + g('cp') + ', Cel.: ' + g('celular') + ', email: ' + g('email');

  return text;
}