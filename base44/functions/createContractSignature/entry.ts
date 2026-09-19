import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ============================================================================
// FIRMA DIGITAL SEGURA
// ----------------------------------------------------------------------------
// Crea el registro de ContractSignature desde el backend (no desde el cliente)
// para garantizar:
//   1. Hash SHA-256 calculado sobre el texto del contrato + datos del firmante
//      + timestamp, usando Web Crypto (crypto.subtle.digest).
//   2. Validación de identidad: el signer_email debe coincidir con el email del
//      usuario autenticado, o el request debe incluir un signing_token válido
//      (signing_token_a / signing_token_b) que coincida con el del contrato.
// ============================================================================

async function computeSignatureHash(contractText, signerData, timestamp) {
  const payload = [
    contractText || '',
    signerData.signer_name || '',
    signerData.signer_email || '',
    signerData.signer_dni || '',
    signerData.party_role || '',
    timestamp,
  ].join('|');
  const encoder = new TextEncoder();
  const data = encoder.encode(payload);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const {
      contract_id,
      party_role,
      signer_name,
      signer_email,
      signer_dni,
      signature_image,
      terms_accepted,
      declaration_accepted,
      signing_token,
    } = body;

    if (!contract_id || !signer_name || !party_role || !signature_image) {
      return Response.json({ error: 'Faltan datos requeridos: contract_id, signer_name, party_role, signature_image' }, { status: 400 });
    }

    // --- Validación de identidad ------------------------------------------------
    // El firmante debe ser el usuario autenticado (email coincide) O presentar un
    // signing_token válido que coincida con el del contrato.
    const contracts = await base44.entities.GeneratedContract.filter({ id: contract_id });
    const contract = contracts[0];
    if (!contract) {
      return Response.json({ error: 'Contrato no encontrado' }, { status: 404 });
    }

    const isOwner = user.email && signer_email && user.email.toLowerCase() === signer_email.trim().toLowerCase();
    const tokenMatches = signing_token && (
      (contract.signing_token_a && contract.signing_token_a === signing_token) ||
      (contract.signing_token_b && contract.signing_token_b === signing_token)
    );

    if (!isOwner && !tokenMatches) {
      return Response.json({ error: 'No estás autorizado a firmar este contrato. El email del firmante debe coincidir con tu cuenta o debés usar un token de firma válido.' }, { status: 403 });
    }

    // --- Metadatos de auditoría (IP, dispositivo, geolocalización) ---------------
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      req.headers.get('cf-connecting-ip') ||
      'IP no disponible';
    const userAgent = req.headers.get('user-agent') || 'Desconocido';

    let geolocation = 'No disponible';
    try {
      if (ip && ip !== 'IP no disponible') {
        const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=city,country,regionName&lang=es`);
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData.city) {
            geolocation = `${geoData.city}, ${geoData.regionName}, ${geoData.country}`;
          }
        }
      }
    } catch (_) { }

    const signedAt = new Date().toISOString();

    // --- Hash SHA-256 -----------------------------------------------------------
    const signatureHash = await computeSignatureHash(
      contract.generated_text || '',
      { signer_name, signer_email, signer_dni, party_role },
      signedAt
    );

    // --- Crear registro de firma ------------------------------------------------
    const signature = await base44.entities.ContractSignature.create({
      contract_id,
      signer_name: signer_name.trim(),
      signer_email: signer_email?.trim() || user.email,
      signer_dni: signer_dni?.trim() || '',
      party_role,
      signature_image,
      signed_at: signedAt,
      ip_address: ip,
      user_agent: userAgent,
      geolocation,
      signature_hash: signatureHash,
      terms_accepted: !!terms_accepted,
      declaration_accepted: !!declaration_accepted,
    });

    // --- Actualizar estado del contrato ----------------------------------------
    const sigFieldKey = party_role === 'part_a' ? 'signature_part_a' : 'signature_part_b';
    const sigData = {
      signer_name: signer_name.trim(),
      signer_email: signer_email?.trim() || user.email,
      signer_dni: signer_dni?.trim() || '',
      signed_at: signedAt,
      ip_address: ip,
      signature_hash: signatureHash,
    };

    const hasA = party_role === 'part_a' || contract.signature_part_a?.signed_at;
    const hasB = party_role === 'part_b' || contract.signature_part_b?.signed_at;
    const newSigStatus = hasA && hasB ? 'fully_signed' : 'partially_signed';

    await base44.entities.GeneratedContract.update(contract_id, {
      [sigFieldKey]: sigData,
      signature_status: newSigStatus,
      status: newSigStatus === 'fully_signed' ? 'signed' : contract.status,
    });

    return Response.json({ ok: true, signature_id: signature.id, signature_hash: signatureHash, signed_at: signedAt });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}