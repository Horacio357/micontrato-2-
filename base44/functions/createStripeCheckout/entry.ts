import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Pagos con Stripe DESACTIVADOS: todos los contratos son gratis.
// En lugar de iniciar un checkout de Stripe, marcamos el contrato como pagado
// y devolvemos la URL de éxito para no romper ningún flujo que aún invoque esta función.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const { contractId } = await req.json();
    if (!contractId) return Response.json({ error: 'Falta contractId' }, { status: 400 });
    const origin = req.headers.get('origin') || 'https://run.base44.com';

    const [contract] = await base44.entities.GeneratedContract.filter({ id: contractId });
    if (!contract) return Response.json({ error: 'Contrato no encontrado' }, { status: 404 });
    if (['draft', 'pending_payment'].includes(contract.status)) {
      await base44.entities.GeneratedContract.update(contractId, { status: 'paid', payment_method: 'single' });
    }

    return Response.json({ url: `${origin}/mi-cuenta/contrato/${contractId}` });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}