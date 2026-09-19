// Auto-generado para Node.js ESM.
export default {
  "metadata": {
    "contrato": "Contrato de Locación Temporaria Turística",
    "version": "V9_Monolitico_Temporaria_Estandarizado_AUDITADO_2026_09",
    "estado": "Produccion"
  },
  "document_settings": {
    "tipografia": "Times New Roman",
    "tamano_fuente": "11pt",
    "alineacion": "justify",
    "formato_markdown_permitido": false
  },
  "input_schema": {
    "cierre_encabezado": {
      "lugar_y_fecha_celebracion_required": "string"
    },
    "locador": {
      "nombre_completo_required": "string",
      "dni_pasaporte_required": "string",
      "cuit_cuil_required": "string",
      "domicilio_calle_required": "string",
      "altura_required": "string",
      "piso_departamento_opcional": "string",
      "localidad_required": "string",
      "provincia_required": [
        "Buenos Aires",
        "Catamarca",
        "Chaco",
        "Chubut",
        "Córdoba",
        "Corrientes",
        "Entre Ríos",
        "Formosa",
        "Jujuy",
        "La Pampa",
        "La Rioja",
        "Mendoza",
        "Misiones",
        "Neuquén",
        "Río Negro",
        "Salta",
        "San Juan",
        "San Luis",
        "Santa Cruz",
        "Santa Fe",
        "Santiago del Estero",
        "Tierra del Fuego",
        "Tucumán"
      ],
      "telefono_required": "string"
    },
    "locatario": {
      "nombre_completo_required": "string",
      "nacionalidad_required": "string",
      "dni_pasaporte_required": "string",
      "cuit_cuil_required": "string",
      "domicilio_calle_required": "string",
      "altura_required": "string",
      "piso_departamento_opcional": "string",
      "localidad_required": "string",
      "provincia_required": [
        "Buenos Aires",
        "Catamarca",
        "Chaco",
        "Chubut",
        "Córdoba",
        "Corrientes",
        "Entre Ríos",
        "Formosa",
        "Jujuy",
        "La Pampa",
        "La Rioja",
        "Mendoza",
        "Misiones",
        "Neuquén",
        "Río Negro",
        "Salta",
        "San Juan",
        "San Luis",
        "Santa Cruz",
        "Santa Fe",
        "Santiago del Estero",
        "Tierra del Fuego",
        "Tucumán"
      ],
      "telefono_required": "string"
    },
    "inmueble": {
      "calle_required": "string",
      "altura_required": "string",
      "piso_departamento_opcional": "string",
      "localidad_required": "string",
      "provincia_required": [
        "Buenos Aires",
        "Catamarca",
        "Chaco",
        "Chubut",
        "Córdoba",
        "Corrientes",
        "Entre Ríos",
        "Formosa",
        "Jujuy",
        "La Pampa",
        "La Rioja",
        "Mendoza",
        "Misiones",
        "Neuquén",
        "Río Negro",
        "Salta",
        "San Juan",
        "San Luis",
        "Santa Cruz",
        "Santa Fe",
        "Santiago del Estero",
        "Tierra del Fuego",
        "Tucumán"
      ],
      "registro_turistico_opcional": "string"
    },
    "estadia": {
      "cantidad_dias_numeros_required": "number",
      "inicio_fecha_required": "string",
      "inicio_hora_required": "string",
      "fin_fecha_required": "string",
      "fin_hora_required": "string"
    },
    "condiciones_economicas": {
      "precio_total_letras_required": "string",
      "precio_total_numeros_required": "string",
      "moneda_required": [
        "Pesos Argentinos",
        "USD",
        "Euros"
      ],
      "dia_pago_senia_required": "string",
      "porcentaje_senia_required": "string",
      "deposito_garantia_letras_required": "string",
      "deposito_garantia_numeros_required": "string",
      "multa_diaria_demora_numeros_required": "string"
    },
    "normas": {
      "cantidad_huespedes_required": "number"
    },
    "cierre": {
      "centro_judicial_required": "string",
      "cantidad_ejemplares_letras_required": "string",
      "cantidad_ejemplares_numeros_required": "number",
      "ciudad_firma_required": "string",
      "dia_firma_required": "string",
      "mes_firma_required": [
        "enero",
        "febrero",
        "marzo",
        "abril",
        "mayo",
        "junio",
        "julio",
        "agosto",
        "septiembre",
        "octubre",
        "noviembre",
        "diciembre"
      ],
      "ano_firma_required": "string"
    }
  },
  "logic_rules": [
    "IF true THEN render(contrato_integro_literal)"
  ],
  "template_blocks": {
    "contrato_integro_literal": "[CENTRAR]CONTRATO DE LOCACIÓN TEMPORARIA TURÍSTICA\n\nEn {{cierre_encabezado.lugar_y_fecha_celebracion_required}}, entre {{locador.nombre_completo_required}}, D.N.I. / Pasaporte Nº {{locador.dni_pasaporte_required}}, C.U.I.T./C.U.I.L. Nº {{locador.cuit_cuil_required}}, con domicilio real en la calle {{locador.domicilio_calle_required}} altura {{locador.altura_required}}, {{locador.piso_departamento_opcional}}, de la localidad de {{locador.localidad_required}} de la provincia de {{locador.provincia_required}}, teléfono: {{locador.telefono_required}}, en adelante denominado el \"LOCADOR\" por una parte; y por la otra {{locatario.nombre_completo_required}}, de nacionalidad {{locatario.nacionalidad_required}}, D.N.I. / Pasaporte Nº {{locatario.dni_pasaporte_required}}, C.U.I.T./C.U.I.L. Nº {{locatario.cuit_cuil_required}}, con domicilio real en la calle {{locatario.domicilio_calle_required}} altura {{locatario.altura_required}}, {{locatario.piso_departamento_opcional}}, de la localidad de {{locatario.localidad_required}} de la provincia de {{locatario.provincia_required}}, teléfono: {{locatario.telefono_required}}, en adelante denominado el \"LOCATARIO\"; se conviene celebrar el presente Contrato de Locación Inmobiliaria Temporaria, el cual se regirá por las disposiciones del Código Civil y Comercial de la Nación, las normativas administrativas locales aplicables, y las siguientes cláusulas:\n\nPRIMERA (objeto y declaración causal): El LOCADOR cede en locación temporaria al LOCATARIO, y este acepta, el inmueble de propiedad del LOCADOR ubicado en la calle {{inmueble.calle_required}} altura {{inmueble.altura_required}}, {{inmueble.piso_departamento_opcional}}, de la ciudad de {{inmueble.localidad_required}}, Provincia de {{inmueble.provincia_required}}, inscripto en el Registro de Alquiler Temporario Turístico según la ley n° 6255 bajo el número {{inmueble.registro_turistico_opcional}}.\n\nSEGUNDA (objeto): Las partes declaran bajo juramento que el presente contrato se celebra exclusivamente con fines de turismo, descanso o recreación, encuadrándose de forma rigurosa en la excepción al plazo mínimo legal prevista en el Artículo 1199, inciso b) del Código Civil y Comercial de la Nación. El LOCATARIO reconoce que no le asiste derecho de permanencia residencial y se obliga a no alterar el destino turístico bajo pena de rescisión inmediata y desalojo.\n\nTERCERA (carácter amoblado): El inmueble se alquila exclusivamente de forma amoblada y equipado para el fin perseguido. El LOCATARIO declara recibir el inmueble, sus muebles, electrodomésticos, aberturas y vajilla en perfecto estado de conservación, funcionamiento e higiene, obligándose a conservarlos y restituirlos en el mismo estado. El detalle exhaustivo del mobiliario y el estado de la unidad se especifican en el \"ANEXO I: INVENTARIO\", que firmado por ambas partes en forma simultánea forma parte integrante y sustancial de este instrumento.\n\nCUARTA (plazo): El plazo de esta locación temporaria es improrrogable, revistiendo el carácter de término esencial debido a las reservas turísticas subsiguientes que pesan sobre el inmueble. Se fija en un total de {{estadia.cantidad_dias_numeros_required}} días, comenzando el día {{estadia.inicio_fecha_required}} a las {{estadia.inicio_hora_required}} horas, y finalizando de pleno derecho, sin necesidad de interpelación, requerimiento ni notificación previa alguna, el día {{estadia.fin_fecha_required}} a las {{estadia.fin_hora_required}} horas, momento exacto en que el LOCATARIO deberá desocupar el inmueble y restituir las llaves al LOCADOR libre de personas y cosas. Las partes acuerdan expresamente que en este contrato no opera la reconducción tácita ni la prórroga por la simple permanencia del LOCATARIO en el inmueble.\n\nQUINTA (precio y forma de pago): El precio total y cerrado de la locación por todo el período pactado se fija en la suma de {{condiciones_economicas.precio_total_letras_required}} (${{condiciones_economicas.precio_total_numeros_required}} {{condiciones_economicas.moneda_required}}). Dicho monto es abonado por el LOCATARIO de la siguiente manera: Deberá abonar en concepto de seña el día {{condiciones_economicas.dia_pago_senia_required}} el {{condiciones_economicas.porcentaje_senia_required}}% del monto total de la locación, y el saldo restante al momento de la entrega de las llaves, sirviendo el presente de eficaz recibo y carta de pago formal una vez percibidos los fondos de manera efectiva. Las partes declaran que la moneda pactada constituye una condición esencial de la contratación. El LOCATARIO renuncia expresamente a la facultad de desobligarse entregando moneda de curso legal (conforme a la disponibilidad de las normas del Art. 765 del CCyCN), obligándose a cancelar el total en la moneda pactada de origen.\n\nSEXTA (depósito en garantía): Para garantizar el fiel cumplimiento de todas y cada una de las obligaciones asumidas por el LOCATARIO, la conservación del inmueble y la devolución integral del inventario, el LOCATARIO entrega al LOCADOR en este acto la suma de {{condiciones_economicas.deposito_garantia_letras_required}} (${{condiciones_economicas.deposito_garantia_numeros_required}} {{condiciones_economicas.moneda_required}}) en calidad de Depósito en Garantía. Dicha suma no genera intereses y será restituida al LOCATARIO en el momento exacto del Check-out, una vez que el LOCADOR constate el estado general de la propiedad y la total correspondencia con el Anexo I (Inventario). Si se verificasen daños, roturas, faltantes o suciedad extraordinaria, el LOCADOR queda expresamente autorizado a retener del depósito los importes necesarios para cubrir las reparaciones o reposiciones a valor de mercado, sin perjuicio de reclamar el saldo si el depósito resultare insuficiente.\n\nSÉPTIMA (cláusula penal por demora en la restitución del inmueble): Si el LOCATARIO no restituyera el inmueble en el día y hora estipulados en la Cláusula Cuarta, se constituirá en mora de pleno derecho por el mero vencimiento del plazo. En tal supuesto, y en concepto de Cláusula Penal Punitoria (Art. 790 y ss. del CCyCN), el LOCATARIO deberá abonar al LOCADOR la suma diaria de ${{condiciones_economicas.multa_diaria_demora_numeros_required}} {{condiciones_economicas.moneda_required}} por cada día o fracción de día de retraso en la entrega de las llaves, hasta su efectiva devolución en sede judicial o extrajudicial. El cobro de esta penalidad no implica prórroga del contrato ni renuncia del LOCADOR a accionar por desalojo inmediato y reclamar los daños y perjuicios derivados de la frustración de reservas subsiguientes.\n\nOCTAVA (número de huéspedes y normas de convivencia): El inmueble locado será ocupado única y exclusivamente por un máximo de {{normas.cantidad_huespedes_required}} personas (incluyendo menores). La identidad de los acompañantes autorizados se detalla en el \"ANEXO II: REGISTRO DE HUÉSPEDES\". Queda terminantemente prohibido el alojamiento de personas no registradas, el subarriendo total o parcial, la cesión del contrato y la realización de fiestas, eventos o actividades ruidosas que violen las ordenanzas municipales de ruidos molestos o el Reglamento de Copropiedad e Interno del edificio. El incumplimiento de cualquiera de estas pautas facultará al LOCADOR a rescindir el contrato por culpa del locatario de forma inmediata, exigir la restitución del bien y aplicar las sanciones pertinentes.\n\nNOVENA (servicios y gastos): Los gastos correspondientes a los servicios de energía eléctrica, gas de red, agua corriente, tasas municipales, expensas del edificio, televisión por cable e internet Wi-Fi se encuentran incluidos en el precio total del canon locativo pactado en la Cláusula Cuarta. El LOCADOR no se hace responsable por los cortes o interrupciones intempestivas de los servicios públicos o de conectividad provistos por las empresas prestatarias locales.\n\nDÉCIMA (cumplimiento regulatorio sub-nacional y deslinde de responsabilidad administrativa): Las partes declaran bajo juramento conocer que la actividad de alquiler temporario turístico se encuentra sujeta a las potestades de policía local, habilitaciones, registros y normativas fiscales o turísticas de carácter provincial o municipal según la jurisdicción donde se sitúa el inmueble. En virtud de ello, acuerdan expresamente: A) DECLARACIÓN DEL LOCADOR: El LOCADOR manifiesta que el inmueble cuenta con las habilitaciones, inscripciones, obleas y/o registros locales exigidos por la autoridad administrativa correspondiente, asumiendo en forma exclusiva cualquier sanción o multa de carácter comercial o fiscal que la autoridad local determine por deficiencias previas en dicha inscripción. B) DESLINDE POR CLAUSURA O SANCIÓN AJENA A LA VOLUNTAD: Si durante la vigencia del plazo contractual previsto en la Cláusula Cuarta, el inmueble fuera objeto de una inspección, clausura preventiva, intimación o sanción por parte de inspectores municipales o provinciales debido a normativas de cupos turísticos locales, restricciones de consorcio imprevistas, o disputas de encuadre hotelero extrahotelero, y siempre que no mediara dolo o culpa grave comprobada del LOCADOR, las partes acuerdan que el presente contrato se resolverá de pleno derecho y por fuerza mayor (Art. 1730 CCyCN). En tal supuesto, la responsabilidad del LOCADOR quedará limitada única y exclusivamente a la restitución proporcional del canon locativo correspondiente a los días de estadía no utilizados por el LOCATARIO, y a la devolución íntegra del Depósito en Garantía (si no hubiere daños). El LOCATARIO renuncia expresamente a reclamar daños materiales, morales, lucro cesante, costos de relocalización hotelera o cualquier otra indemnización civil en sede judicial o extrajudicial. C) OBLIGACIÓN DE INDEMNIDAD DEL LOCATARIO: El LOCATARIO se obliga a acatar rigurosamente las inspecciones legítimas de las autoridades locales y a cumplir con los deberes de conducta y ocupación máxima fijados por el municipio o el consorcio. Si la clausura, multa o sanción administrativa local fuera provocada por el obrar culposo del LOCATARIO (ruidos molestos, exceso de huéspedes, alteración del orden, falta de exhibición de documentación de menores en los anexos, etc), el LOCATARIO será única y solidariamente responsable ante la autoridad pública, debiendo mantener totalmente indemne al LOCADOR y responder por los daños y perjuicios directos e indirectos ocasionados a la propiedad y al giro comercial del locador.\n\nDÉCIMO PRIMERA (domicilios constituidos y notificaciones electrónicas): Para todos los efectos legales derivados del presente, las partes constituyen sus domicilios especiales en los declarados en el encabezamiento. Asimismo, y de conformidad con el Artículo 75 del Código Civil y Comercial de la Nación, pactan expresamente la validez de las notificaciones e intimaciones que se realicen a los domicilios electrónicos denunciados.\n\nDÉCIMO SEGUNDA (jurisdicción y ley aplicable): El presente contrato se rige exclusivamente por las leyes de la República Argentina. Para cualquier divergencia, litigio o ejecución judicial que pudiera suscitarse con motivo de la interpretación o cumplimiento de este instrumento, las partes renuncian expresamente a cualquier otro fuero o jurisdicción que pudiera corresponderles (inclusive el de sus domicilios reales) y se someten voluntariamente a la jurisdicción de los Tribunales Ordinarios de {{cierre.centro_judicial_required}}.\n\nDÉCIMO TERCERA (lugar y fecha): En prueba de plena conformidad y aceptación de las cláusulas precedentes, se firman {{cierre.cantidad_ejemplares_letras_required}} ({{cierre.cantidad_ejemplares_numeros_required}}) ejemplares de un mismo tenor y a un solo efecto en la ciudad de {{cierre.ciudad_firma_required}}, el día {{cierre.dia_firma_required}} del mes de {{cierre.mes_firma_required}} del año {{cierre.ano_firma_required}}."
  }
};
