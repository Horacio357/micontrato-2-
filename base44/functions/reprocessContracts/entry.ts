import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const guarantorKeys = {
  g1_nombre_opcional: ['garante_nombre_completo', 'fiador_nombre'],
  g1_nacionalidad_opcional: ['garante_nacionalidad', 'fiador_pais'],
  g1_estado_civil_opcional: ['garante_estado_civil', 'fiador_estado_civil'],
  g1_dni_opcional: ['garante_dni', 'fiador_dni'],
  g1_cuit_cuil_opcional: ['garante_cuit_cuil', 'fiador_cuil_cuit'],
  g1_domicilio_calle_opcional: ['garante_calle', 'fiador_calle'],
  g1_altura_opcional: ['garante_altura', 'fiador_numero'],
  g1_localidad_opcional: ['garante_localidad', 'fiador_ciudad'],
  g1_provincia_opcional: ['garante_provincia', 'fiador_provincia'],
};

function migrateMutuoFormData(formData) {
  const migrated = { ...(formData || {}), garantes: { ...(formData?.garantes || {}) } };
  Object.entries(guarantorKeys).forEach(([nestedKey, oldKeys]) => {
    if (migrated.garantes[nestedKey] === undefined) {
      const candidates = [migrated[`garantes_${nestedKey}`], ...oldKeys.map((key) => migrated[key])];
      migrated.garantes[nestedKey] = candidates.find((value) => value != null && String(value).trim() !== '') ?? '';
    }
  });
  return migrated;
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { contractSlug = 'mutuo-oneroso', dryRun = true, offset = 0, limit = 50 } = await req.json();
    if (contractSlug !== 'mutuo-oneroso') return Response.json({ error: 'Esta regeneración se limita al Mutuo Oneroso.' }, { status: 400 });
    const pageSize = Math.min(50, Math.max(1, Number(limit) || 50));
    const contracts = await base44.asServiceRole.entities.GeneratedContract.filter({ template_id: contractSlug }, '-created_date', pageSize, offset);
    const results = { total: contracts.length, updated: 0, ready: 0, skipped: 0, failed: 0, errors: [] };

    for (const contract of contracts) {
      try {
        const signatures = await base44.asServiceRole.entities.ContractSignature.filter({ contract_id: contract.id }, '-created_date', 1);
        if (signatures.length || ['signed', 'pending_signature'].includes(contract.status) ||
            (contract.signature_status && contract.signature_status !== 'not_required') ||
            contract.signature_part_a || contract.signature_part_b || contract.signing_token_a || contract.signing_token_b) {
          results.skipped += 1;
          continue;
        }
        const formData = migrateMutuoFormData(contract.form_data);
        if (!/^(pesos argentinos|usd|d[oó]lares(?: estadounidenses)?(?: billete)?)$/i.test(String(formData.moneda || '').trim())) throw new Error('Moneda ausente o no reconocida; requiere revisión.');
        const response = await base44.functions.invoke('generateContractAI', { contractSlug, province: contract.province, formData, preview: true });
        const generatedText = response?.data?.generated_text;
        if (!generatedText) throw new Error('El motor no devolvió el documento esperado');
        let source = contract.generated_text || '';
        if (/^https?:\/\//.test(source)) {
          const download = await fetch(source);
          if (!download.ok) throw new Error('No se pudo recuperar el contrato original');
          source = await download.text();
        }
        let original = source;
        if (source.trimStart().startsWith('{')) {
          const document = JSON.parse(source);
          original = document.text || document.blocks?.map((block) => block.content).join('\n\n') || '';
        }
        const section = /QUINTA\s*\(Moneda de Pago[\s\S]*?(?=SÉPTIMA\s*\(Caducidad)/;
        const replacement = generatedText.match(section)?.[0];
        if (!replacement || !section.test(original)) throw new Error('No se identificaron las cláusulas originales; requiere revisión.');
        const updatedText = original.replace(section, () => replacement);
        results.ready += 1;
        if (!dryRun) {
          // Solo V y VI cambian; texto breve almacenado directamente, sin publicar datos personales.
          await base44.asServiceRole.entities.GeneratedContract.update(contract.id, {
            form_data: formData, generated_text: updatedText, docx_url: '', pdf_url: '',
          });
          results.updated += 1;
        }
      } catch (error) {
        results.failed += 1;
        results.errors.push({ id: contract.id, error: error.message });
      }
    }
    return Response.json({ ...results, dryRun, nextOffset: contracts.length === pageSize ? Number(offset) + pageSize : null });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}