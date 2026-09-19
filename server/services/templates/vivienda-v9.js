// Auto-generado para Node.js ESM.
export default {
  "metadata": {
    "contrato": "Contrato de Locación de Inmueble (Vivienda)",
    "version": "V9_Monolitico_Final_Perfecto_AUDITADO_2026_09",
    "estado": "Produccion"
  },
  "document_settings": {
    "tipografia": "Times New Roman",
    "tamano_fuente": "11pt",
    "alineacion": "justify",
    "formato_markdown_permitido": false
  },
  "input_schema": {
    "locador": {
      "nombre_completo_required": "string",
      "dni_required": "string",
      "cuit_cuil_required": "string",
      "correo_electronico_required": "string",
      "estado_civil_required": "string",
      "domicilio_required": "string",
      "ciudad_required": "string",
      "departamento_partido_required": "string",
      "provincia_required": "string",
      "fecha_nacimiento_nacionalidad_required": "string"
    },
    "locatario": {
      "nombre_completo_required": "string",
      "dni_required": "string",
      "cuit_cuil_required": "string",
      "correo_electronico_required": "string",
      "fecha_nacimiento_required": "string",
      "estado_civil_required": "string",
      "nacionalidad_required": "string",
      "domicilio_required": "string",
      "ciudad_required": "string",
      "departamento_partido_required": "string",
      "provincia_required": "string"
    },
    "inmueble": {
      "calle_required": "string",
      "altura_required": "string",
      "piso_departamento_required": "string",
      "nomenclatura_catastral_required": "string",
      "partida_inmobiliaria_required": "string",
      "ciudad_inmueble_required": "string",
      "departamento_inmueble_required": "string",
      "provincia_inmueble_required": "string",
      "cantidad_habitaciones_required": [
        "No tiene",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6"
      ],
      "habitaciones_detalle_required": "string"
    },
    "plazo": {
      "cantidad_meses_numeros_required": "number",
      "inicio_fecha_required": "string",
      "fin_fecha_required": "string"
    },
    "condiciones_economicas": {
      "monto_mensual_letras_required": "string",
      "monto_mensual_numeros_required": "string",
      "periodo_primer_pago_required": "string",
      "indice_actualizacion_required": [
        "ICL",
        "IPC",
        "Otro"
      ],
      "indice_actualizacion_otro_opcional": "string",
      "porcentaje_interes_numeros_required": "string",
      "porcentaje_interes_letras_required": "string",
      "servicios_a_cargo_required": "string",
      "monto_deposito_letras_required": "string",
      "monto_deposito_numeros_required": "string"
    },
    "garantes": {
      "g1_nombre_opcional": "string",
      "g1_dni_opcional": "string",
      "g1_cuit_cuil_opcional": "string",
      "g1_nacionalidad_opcional": "string",
      "g1_estado_civil_opcional": "string",
      "g1_domicilio_calle_opcional": "string",
      "g1_ciudad_opcional": "string",
      "g1_departamento_opcional": "string",
      "g1_provincia_opcional": "string",
      "g1_correo_electronico_opcional": "string"
    },
    "cierre": {
      "centro_judicial_required": "string",
      "cantidad_ejemplares_letras_required": "string",
      "cantidad_ejemplares_numeros_required": "number",
      "ciudad_firma_required": "string",
      "departamento_firma_required": "string",
      "provincia_firma_required": "string",
      "dia_firma_required": "string",
      "mes_firma_required": [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre"
      ],
      "ano_firma_required": "string"
    }
  },
  "logic_rules": [
    "IF true THEN render(contrato_integro_literal)"
  ],
  "template_blocks": {
    "contrato_integro_literal": "[CENTRAR]CONTRATO DE LOCACIÓN DE INMUEBLE\n\nEntre {{locador.nombre_completo_required}}, D.N.I. nro. {{locador.dni_required}}, CUIL/T nro. {{locador.cuit_cuil_required}}, correo electrónico: {{locador.correo_electronico_required}}, nacido el {{locador.fecha_nacimiento_nacionalidad_required}}, mayor de edad, de estado civil {{locador.estado_civil_required}}, domiciliada en calle {{locador.domicilio_required}}, de la ciudad de {{locador.ciudad_required}}, Departamento/partido de {{locador.departamento_partido_required}} de la provincia de {{locador.provincia_required}}, por una parte y en adelante la PARTE LOCADORA y por la otra parte {{locatario.nombre_completo_required}}, D.N.I. nro. {{locatario.dni_required}}, CUIL/T nro. {{locatario.cuit_cuil_required}}, correo electrónico: {{locatario.correo_electronico_required}}, nacido el {{locatario.fecha_nacimiento_required}}, de estado civil {{locatario.estado_civil_required}}, {{locatario.nacionalidad_required}}, mayor de edad, domiciliado en calle {{locatario.domicilio_required}} de la ciudad de {{locatario.ciudad_required}}, Departamento/partido de {{locatario.departamento_partido_required}} de la provincia de {{locatario.provincia_required}}, en adelante la PARTE LOCATARIA, convienen en celebrar el siguiente CONTRATO DE LOCACIÓN sujeto a las cláusulas y condiciones que siguen:\n\nPRIMERA (Objeto): La PARTE LOCADORA cede el uso y goce a título de LOCACIÓN a favor de la PARTE LOCATARIA una Unidad Funcional a sito en calle {{inmueble.calle_required}} número {{inmueble.altura_required}}, Piso/Departamento {{inmueble.piso_departamento_required}}, nomenclatura catastral {{inmueble.nomenclatura_catastral_required}}, partida inmobiliaria {{inmueble.partida_inmobiliaria_required}}, en adelante denominada UNIDAD LOCADA de la ciudad de {{inmueble.ciudad_inmueble_required}}, Departamento/partido de {{inmueble.departamento_inmueble_required}}, Provincia de {{inmueble.provincia_inmueble_required}}.\n\nSEGUNDA (descripción): La UNIDAD LOCADA está compuesta por {{inmueble.cantidad_habitaciones_required}} habitaciones, especificamente {{inmueble.habitaciones_detalle_required}}. Al presente contrato se encuentra anexo un inventario titulado “ANEXO I- inventario” donde se encuentran individualizadas cada una de las habitaciones, las condiciones generales de cada una de ellas a la fecha de la celebración de este contrato, y los bienes muebles que se encuentran en cada una de ellas. La PARTE LOCATARIA lo recibe de conformidad y en buen estado aparente de conservación y funcionamiento, de uso y habitabilidad, obligándose a devolverlo al fin del contrato en igual forma y condiciones, salvo deterioros derivados del uso regular y antigüedad.\n\nTERCERA: (plazo): El plazo de la locación se fija en {{plazo.cantidad_meses_numeros_required}} meses, comenzando a regir a partir del {{plazo.inicio_fecha_required}}, venciendo en consecuencia el día {{plazo.fin_fecha_required}}, sin necesidad de notificación alguna, fecha en que deberá ser devuelta la UNIDAD LOCADA, libre de ocupantes a la PARTE LOCADORA.\n\nCUARTA (destino): LA UNIDAD LOCADA será destinada únicamente a vivienda familiar de la PARTE LOCATARIA y sus grupos familiares, el que no podrá ser alterado durante la vigencia del contrato, sin conformidad previa y emanada por escrito de la PARTE LOCADORA. El cambio o variación de este destino será considerado causa de resolución del contrato, con derecho para la PARTE LOCADORA de solicitar el desalojo del inmueble, con los daños y perjuicios pertinentes.\n\nQUINTA (precio): El alquiler mensual será de PESOS ARGENTINOS {{condiciones_economicas.monto_mensual_letras_required}} (${{condiciones_economicas.monto_mensual_numeros_required}}), durante el primer {{condiciones_economicas.periodo_primer_pago_required}} de CONTRATO. Entre las partes de común acuerdo establecen que el incremento será conforme al siguiente índice: {{condiciones_economicas.indice_actualizacion_required}} {{condiciones_economicas.indice_actualizacion_otro_opcional}}. La actualización será automática y no requerirá notificación previa.\n\nSEXTA (periodo y lugar de pago): La PARTE LOCATARIA deberá pagar el alquiler en el domicilio de la PARTE LOCADORA, o donde ésta indique fehacientemente, por mes completo y adelantado, entre los días 1º y el 10 de cada mes como término de gracia.\n\nSEPTIMA (intereses): La falta de pago del alquiler en tiempo y forma hará incurrir a la PARTE LOCATARIA en mora automática, pactándose un interés mensual del {{condiciones_economicas.porcentaje_interes_numeros_required}}% ({{condiciones_economicas.porcentaje_interes_letras_required}}) desde el primer día de atraso, es decir desde el segundo día de cada mes. En el supuesto que la PARTE LOCATARIA cancele el pago del alquiler hasta el décimo día de cada mes, la PARTE LOCADORA se obliga en forma irrevocable a condonar los intereses que se hubiesen generado por dicho período locativo. Es decir que, si LOS LOCATARIOS pagan el alquiler hasta el décimo día, no deberán intereses por ese periodo, mientras que, si lo cancelan luego del décimo día deberán los intereses devengados a partir del segundo día de ese mes.\n\nOCTAVA (tasas y Servicios): Está a cargo de la PARTE LOCATARIA el pago de {{condiciones_economicas.servicios_a_cargo_required}}. Deberá entregar las boletas con las constancias de su pago a la PARTE LOCADORA al finalizar el contrato.\n\nNOVENA (resolución anticipada): La PARTE LOCATARIA tiene derecho a rescindir el presente contrato después de transcurridos los seis primeros meses de vigencia, de acuerdo a la facultad especialmente establecida en el artículo 1221 de CC&C y CN, sin perjuicio de la indemnización correspondiente en favor de la PARTE LOCADORA según lo dispone el artículo 1221 de CC&C. La PARTE LOCATARIA deberá notificar su decisión fehacientemente y por escrito a la PARTE LOCADORA con UN (1) MES de anticipación.\n\nDECIMA (estado del inmueble y declaración de la locataria): La UNIDAD LOCADA, objeto de este instrumento, se encuentra en buen estado aparente de habitabilidad y funcionamiento. La PARTE LOCATARIA declara haber visitado personalmente el inmueble objeto de la presente locación y se obliga a restituir el inmueble al finalizar el presente contrato en las mismas y/o mejores condiciones en que lo recibe, salvo deterioros derivados del uso regular y antigüedad.\n\nDECIMO PRIMERA (mejoras y Conservación del inmueble): 1. MEJORAS DEL INMUEBLE: Pactando las partes que las mejoras que se realicen en el inmueble quedarán en beneficio de éste sin que la PARTE LOCADORA tenga que restituir suma alguna por este concepto. 2. CONSERVACION DEL INMUEBLE y/o MUEBLES: Es a cargo de la PARTE LOCATARIA la conservación del inmueble objeto de la presente locación, en las condiciones que lo recibió, como así también las instalaciones que se encuentran en el mismo. Esta deberá efectuar todas las reparaciones necesarias derivadas del uso ordinario del inmueble para que el inmueble y sus instalaciones resulten adecuadas al destino de la locación, desde la iniciación del presente contrato y hasta que la PARTE LOCADORA lo reciba de conformidad, hecho este, que se producirá cuando la PARTE LOCATARIA haya cumplido todas las obligaciones a su cargo. La PARTE LOCADORA estará a cargo de las reparaciones estructurales, vicios ocultos y deterioros no imputables al uso normal del inmueble.\n\nDECIMO SEGUNDA (inspección): La PARTE LOCADORA y/o la inmobiliaria se reservan el derecho de inspeccionar el inmueble en forma periódica, previo aviso razonable a la PARTE LOCATARIA, debiendo la PARTE LOCATARIA comunicarle cualquier daño o desperfecto que se produzca en el mismo dentro de las cuarenta y ocho (48hs.) horas de ocurrido.\n\nDECIMO TERCERA (eximición de responsabilidad de la PARTE LOCADORA): La PARTE LOCADORA no responderá por daños derivados del uso indebido del inmueble, hechos de terceros o caso fortuito, salvo supuestos legalmente atribuibles a su responsabilidad.\n\nDECIMO CUARTA (prohibición de Ceder): Queda expresamente prohibido ceder el presente contrato de locación, permutar, transferir, subarrendar o prestar total o parcialmente la propiedad, objeto de la presente. La violación de estas prohibiciones dará lugar a la rescisión culposa del contrato y al desalojo correspondiente, además del pago de daños y perjuicios que resulten.\n\nDECIMO CUARTA (depósito en garantía): En garantía de las obligaciones contraídas mediante este contrato, la PARTE LOCATARIA da en depósito a la PARTE LOCADORA la suma de Pesos {{condiciones_economicas.monto_deposito_letras_required}} (${{condiciones_economicas.monto_deposito_numeros_required}}). Este importe no podrá computarse a pagos de alquileres atrasados o vigentes, penalidades, cargas u obligaciones debidas por aquel, con la salvedad de lo que a continuación se conviene. Es en calidad de depósito de garantía y responde en parte o totalmente a los desperfectos, daños o roturas originadas en la propiedad, sus artefactos o accesorios, y que la PARTE LOCADORA observe cuando la PARTE LOCATARIA al finalizar la locación, siempre y cuando de fiel cumplimiento a todas las obligaciones contraídas mediante este contrato, y restituye al inmueble y sus accesorios al término del presente a entera conformidad de la PARTE LOCADORA. Caso contrario dicha suma quedará en poder de esta y sin perjuicio de iniciar acciones judiciales por mayor monto en caso de ser necesaria.\n\nDECIMO QUINTA (garantes): Presentes en este acto, el señor/los señores {{garantes.g1_nombre_opcional}}, D.N.I. N° {{garantes.g1_dni_opcional}}, C.U.I.L./C.U.I.T. N° {{garantes.g1_cuit_cuil_opcional}}, nacionalidad {{garantes.g1_nacionalidad_opcional}}, mayor de edad, estado civil {{garantes.g1_estado_civil_opcional}}, con domicilio en calle {{garantes.g1_domicilio_calle_opcional}}, de la ciudad de {{garantes.g1_ciudad_opcional}}, departamento {{garantes.g1_departamento_opcional}}, de la provincia de {{garantes.g1_provincia_opcional}}, e-mail: {{garantes.g1_correo_electronico_opcional}}, se interiorizan del presente contrato de locación, y se constituyen en codeudores lisos, llanos y principales pagadores de todas las obligaciones emergentes de este contrato, en adelante denominados LOS GARANTES, renunciando al beneficio de división previa excusión.\n\nDECIMO SEXTA (restitución del inmueble): La restitución del inmueble solo se tendrá por perfeccionada con la entrega material de todas las llaves.\n\nDECIMO SEPTIMA (domicilios y Jurisdicción): Para todos los efectos, tanto legales como judiciales o extrajudiciales, que se deriven de este contrato las partes se someten a la jurisdicción de los Tribunales Ordinarios de {{cierre.centro_judicial_required}} siempre que resulte legalmente competente, siendo validas las notificaciones que se realicen en los domicilios indicados en el encabezamiento del presente contrato. Las partes contratantes hacen expresa renuncia al Fuero Federal y constituyen domicilios especiales para todos los efectos legales, judiciales o extrajudiciales los que se enuncian en este instrumento.\n\nDECIMO OCTAVA (domicilio electrónico): Las partes constituyen como domicilios electrónicos válidos los correos electrónicos denunciados en el presente contrato.\n\nDECIMO NOVENA (firmas e instrumentación): 1. Se suscriben {{cierre.cantidad_ejemplares_letras_required}} ({{cierre.cantidad_ejemplares_numeros_required}}) ejemplares iguales de este CONTRATO, a un solo efecto. 2. En este mismo acto, la PARTE LOCATARIA recibe las llaves y la tenencia de la UNIDAD LOCADA.\n\nVIGECIMO (lugar y fecha): Celebrado en la Ciudad de {{cierre.ciudad_firma_required}}, departamento/partido de {{cierre.departamento_firma_required}}, en la provincia de {{cierre.provincia_firma_required}} a los días {{cierre.dia_firma_required}} de {{cierre.mes_firma_required}} del año {{cierre.ano_firma_required}}."
  }
};
