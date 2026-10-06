/**
 * Helper para desempaquetar y estructurar el texto de contratos legales.
 * Extrae texto de payloads JSON, objetos con bloques y formatea la estructura
 * legal (título, comparecencia, cláusulas numeradas y bloque de firmas).
 */

export function parseContractText(raw) {
  if (!raw) return "";

  let content = raw;

  // Si ya es un objeto (o parsed JSON)
  if (typeof content === "object" && content !== null) {
    if (typeof content.text === "string" && content.text.trim()) {
      content = content.text;
    } else if (Array.isArray(content.blocks) && content.blocks.length > 0) {
      content = content.blocks
        .map((b) => (typeof b === "string" ? b : b.content || ""))
        .filter(Boolean)
        .join("\n\n");
    } else {
      try {
        content = JSON.stringify(content);
      } catch {
        content = String(content);
      }
    }
  }

  // Si es un string que contiene JSON serializado
  if (typeof content === "string") {
    const trimmed = content.trim();
    if (
      (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
      (trimmed.startsWith("[") && trimmed.endsWith("]"))
    ) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed && typeof parsed === "object") {
          if (typeof parsed.text === "string" && parsed.text.trim()) {
            content = parsed.text;
          } else if (Array.isArray(parsed.blocks) && parsed.blocks.length > 0) {
            content = parsed.blocks
              .map((b) => (typeof b === "string" ? b : b.content || ""))
              .filter(Boolean)
              .join("\n\n");
          }
        }
      } catch {
        // No es JSON válido, conservar el string original
      }
    }
  }

  if (typeof content !== "string") {
    content = String(content || "");
  }

  // Normalizar saltos de línea y remover etiquetas de control
  return content
    .replace(/^\[CENTRAR\]\s*/i, "")
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\r\n/g, "\n")
    .trim();
}

/**
 * Parser de párrafo para identificar cláusulas de cualquier contrato legal argentino:
 * - PRIMERA (Objeto):
 * - PRIMERA: objeto:
 * - DÉCIMO PRIMERA: expensas, impuestos y servicios:
 * - Primera. Objeto / Primero. Objeto
 * - Cláusula 1ª: Objeto
 */
export function parseClauseParagraph(para) {
  // Patrón A: Cláusulas tradicionales con dos puntos o paréntesis
  const colonMatch = para.match(
    /^((?:(?:CL[AÁ]USULA|Cl[aá]usula)\s+)?(?:(?:DÉCIMO|DECIMO|VIGÉSIMO|VIGESIMO|TRIGÉSIMO|TRIGESIMO|Décimo|Vigésimo|Trigésimo)\s+)?[A-Za-zÁÉÍÓÚáéíóúñÑ\dºª]+(?::(?:\s*\([^\)]+\)|\s*[^:\n]+)*|\s*\([^\)]+\))(?::|\.))\s*([\s\S]*)$/i
  );
  if (colonMatch) {
    return { heading: colonMatch[1].trim(), body: colonMatch[2].trim() };
  }

  // Patrón B: Cláusulas con punto y salto o texto corto ("Primera. Objeto")
  const dotMatch = para.match(
    /^((?:(?:CL[AÁ]USULA|Cl[aá]usula)\s+)?(?:(?:D[eé]cimo|Vig[eé]simo)\s+)?[A-Za-zÁÉÍÓÚáéíóúñÑ\dºª]+(?:\.|\:)\s*[^\n\.\:]{2,60}(?:\.|\:|\n))\s*([\s\S]*)$/
  );
  if (dotMatch) {
    return {
      heading: dotMatch[1].replace(/[\n\s]+$/, "").trim(),
      body: dotMatch[2].trim(),
    };
  }

  // Patrón C: Encabezado corto tipo "Cláusula Nª:"
  const clauseShort = para.match(
    /^((?:CL[AÁ]USULA|Cl[aá]usula)\s+[A-Za-zÁÉÍÓÚáéíóúñÑ\dºª]+(?:\s*\([^\)]+\))?[:\.])\s*([\s\S]*)$/i
  );
  if (clauseShort) {
    return { heading: clauseShort[1].trim(), body: clauseShort[2].trim() };
  }

  return { heading: "", body: para };
}

/**
 * Extrae las partes intervinientes con nombres, roles y DNI según la tipología del contrato
 */
export function extractContractParties(text = "", formData = {}) {
  const isMutuo = /mutuo/i.test(text) || Boolean(formData?.monto_capital_numeros);
  const isServicios =
    /servicios profesionales/i.test(text) || Boolean(formData?.prestador_nombre_profesion);
  const isConfidencialidad =
    /confidencialidad/i.test(text) || Boolean(formData?.parte_a_nombre_razon_social);

  let roleA = "PARTE LOCADORA";
  let roleB = "PARTE LOCATARIA";

  if (isMutuo) {
    roleA = "MUTUANTE";
    roleB = "MUTUARIO";
  } else if (isServicios) {
    roleA = "PRESTADOR";
    roleB = "CLIENTE";
  } else if (isConfidencialidad) {
    roleA = "PARTE A";
    roleB = "PARTE B";
  }

  const partyA = {
    role: roleA,
    name:
      formData?.locador_nombre_completo ||
      formData?.locador_nombre ||
      formData?.mutuante_nombre_completo ||
      formData?.mutuante_nombre ||
      formData?.prestador_nombre_profesion ||
      formData?.parte_a_nombre_razon_social ||
      formData?.["locador.nombre_completo_required"] ||
      formData?.["mutuante.nombre_completo_required"] ||
      formData?.["prestador.nombre_y_profesion_required"] ||
      formData?.["parte_a.nombre_o_razon_social_required"] ||
      "",
    dni:
      formData?.locador_dni ||
      formData?.locador_dni_pasaporte ||
      formData?.mutuante_dni ||
      formData?.parte_a_cuit ||
      formData?.["locador.dni_required"] ||
      formData?.["mutuante.dni_required"] ||
      "",
  };

  const partyB = {
    role: roleB,
    name:
      formData?.locatario_nombre_completo ||
      formData?.locatario_nombre ||
      formData?.mutuario_nombre_completo ||
      formData?.mutuario_nombre ||
      formData?.cliente_nombre_razon_social ||
      formData?.parte_b_nombre_razon_social ||
      formData?.["locatario.nombre_completo_required"] ||
      formData?.["mutuario.nombre_completo_required"] ||
      formData?.["cliente.nombre_o_razon_social_required"] ||
      formData?.["parte_b.nombre_o_razon_social_required"] ||
      "",
    dni:
      formData?.locatario_dni ||
      formData?.locatario_dni_pasaporte ||
      formData?.mutuario_dni ||
      formData?.parte_b_cuit ||
      formData?.["locatario.dni_required"] ||
      formData?.["mutuario.dni_required"] ||
      "",
  };

  const garante = {
    role: "GARANTE / FIADOR",
    name: formData?.garantes_g1_nombre || formData?.["garantes.g1_nombre_opcional"] || "",
    dni: formData?.garantes_g1_dni || formData?.["garantes.g1_dni_opcional"] || "",
  };

  // Respaldo por regex en el texto
  if (!partyA.name && text) {
    const mutuoA = text.match(
      /Sr\.\/Sra\.\s+([A-Za-zÁÉÍÓÚáéíóúñÑ\s]+?)\s*,\s*(?:D\.?N\.?I|con C\.U\.I\.T)[\s\S]*?"MUTUANTE"/i
    );
    const m =
      mutuoA ||
      text.match(
        /Entre\s+(?:el\/la\s+Sr\.\/Sra\.\s+)?([A-Za-zÁÉÍÓÚáéíóúñÑ\s\.\/]+?),\s*(?:D\.?N\.?I\.?|Documento|profesional|con domicilio)/i
      );
    if (m) partyA.name = m[1].replace(/^(?:el\/la\s+)?(?:Sr\.\/Sra\.\s+)?/i, "").trim();
  }
  if (!partyA.dni && text) {
    const m = text.match(/Entre[\s\S]*?(?:D\.?N\.?I\.?|Documento)[^\d]*([\d\.]+)/i);
    if (m) partyA.dni = m[1].trim();
  }

  if (!partyB.name && text) {
    const mutuoB = text.match(
      /"MUTUANTE"[\s\S]*?Sr\.\/Sra\.\s+([A-Za-zÁÉÍÓÚáéíóúñÑ\s]+?)\s*,\s*D\.?N\.?I[\s\S]*?"MUTUARIO"/i
    );
    const m =
      mutuoB ||
      text.match(
        /(?:otra parte|y por la otra(?: parte)?(?: y en adelante LA PARTE LOCATARIA,)?|\,\s*y\s+)\s*(?:y en adelante la PARTE LOCATARIA,\s*)?([A-Za-zÁÉÍÓÚáéíóúñÑ\s\.\/]+?),\s*(?:D\.?N\.?I\.?|Documento|con domicilio|en adelante)/i
      );
    if (m)
      partyB.name = m[1]
        .replace(/^(?:la\s+)?parte\s+/i, "")
        .replace(/^(?:el\/la\s+)?(?:Sr\.\/Sra\.\s+)?/i, "")
        .replace(/^y\s+/i, "")
        .trim();
  }
  if (!partyB.dni && text) {
    const m = text.match(
      /(?:otra parte|y por la otra|"MUTUARIO")[\s\S]*?(?:D\.?N\.?I\.?|Documento)[^\d]*([\d\.]+)/i
    );
    if (m) partyB.dni = m[1].trim();
  }

  // Chequeo de garante
  if (!garante.name && text) {
    const m = text.match(
      /(?:codeudores|garantes|fiador)[\s\S]*?(?:señor\/los señores|el\/la Sr\.\/Sra\.)\s+([A-Za-zÁÉÍÓÚáéíóúñÑ\s]+?),\s*D\.?N\.?I/i
    );
    if (m) garante.name = m[1].trim();
  }
  if (!garante.dni && garante.name && text) {
    const m = text.match(
      new RegExp(garante.name + "[\\s\\S]*?D\\.?N\\.?I\\.?[^\\d]*([\\d\\.]+)", "i")
    );
    if (m) garante.dni = m[1].trim();
  }

  const hasGaranteData = Boolean(
    garante.name && !/sin la constituci[oó]n|No aplica|^0$/i.test(garante.name)
  );

  return {
    locador: partyA,
    locatario: partyB,
    garante: hasGaranteData ? garante : null,
  };
}

/**
 * Desglosa el documento legal en secciones estructuradas
 */
export function parseContractStructure(rawText = "", formData = {}) {
  const text = parseContractText(rawText);
  if (!text) {
    return {
      title: "",
      preamble: "",
      clauses: [],
      parties: { locador: {}, locatario: {}, garante: null },
    };
  }

  const paragraphs = text
    .split(/\n\s*\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (paragraphs.length === 0) {
    return {
      title: "",
      preamble: "",
      clauses: [],
      parties: { locador: {}, locatario: {}, garante: null },
    };
  }

  let title = "";
  let preamble = "";
  const clauses = [];

  const firstPara = paragraphs[0];
  const isTitle =
    firstPara.length < 120 &&
    (firstPara === firstPara.toUpperCase() ||
      /^CONTRATO|^CONVENIO|^ACUERDO|^BOLETO/i.test(firstPara)) &&
    /[A-ZÁÉÍÓÚÑ]/.test(firstPara);

  let startIndex = 0;
  if (isTitle) {
    title = firstPara;
    startIndex = 1;
  }

  for (let i = startIndex; i < paragraphs.length; i++) {
    const para = paragraphs[i];
    const parsed = parseClauseParagraph(para);

    if (parsed.heading) {
      const heading = parsed.heading;
      const body = parsed.body;

      // Chequear si contiene subpuntos enumerados tipo "1. ... 2. ..."
      const subItemMatches = body.split(/(?=\b\d+\.\s+)/);
      if (subItemMatches.length > 1 && /^\d+\.\s+/.test(subItemMatches[0])) {
        clauses.push({
          heading,
          body: "",
          subItems: subItemMatches.map((s) => s.trim()).filter(Boolean),
        });
      } else {
        clauses.push({ heading, body });
      }
    } else {
      if (!preamble && i === startIndex) {
        preamble = para;
      } else {
        clauses.push({ heading: "", body: para });
      }
    }
  }

  const parties = extractContractParties(text, formData);

  return {
    title,
    preamble,
    clauses,
    parties,
  };
}
