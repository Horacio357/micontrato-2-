import { useQuery, useQueryClient } from '@tanstack/react-query';
import StripePortalActions from '@/components/account/StripePortalActions';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

const labels = { none: 'Sin suscripción', active: 'Activa', trialing: 'En período de prueba', past_due: 'Pago pendiente', unpaid: 'Impaga', canceled: 'Cancelada', incomplete: 'Pago inicial pendiente', incomplete_expired: 'Pago inicial vencido', paused: 'Pausada' };
const date = (value) => new Date(value).toLocaleDateString('es-AR');
export default function SubscriptionPanel() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['subscription-status'], queryFn: async () => {
    const { data } = await base44.functions.invoke('syncSubscriptionStatus', {});
    if (data.error) throw new Error(data.error);
    queryClient.invalidateQueries({ queryKey: ['me'] });
    return data;
  }, refetchOnWindowFocus: 'always', staleTime: 0, retry: false });
  const sub = query.data;
  return (
    <section className="mb-10 rounded border border-border bg-card p-5" aria-labelledby="subscription-title">
      <h2 id="subscription-title" className="font-semibold text-foreground">Mi suscripción</h2>
      {query.isLoading ? <p className="mt-2 text-sm text-muted-foreground" role="status">Consultando estado en Stripe...</p> : query.isError ? (
        <div role="alert" className="mt-2"><p className="text-sm text-destructive">No pudimos consultar tu suscripción. Intentá nuevamente.</p><Button variant="outline" className="mt-3" disabled={query.isFetching} onClick={() => query.refetch()}>Reintentar</Button></div>
      ) : sub && <>
        <p className="mt-2 font-medium">{sub.cancel_at && sub.has_subscription ? 'Cancelación programada' : labels[sub.subscription_status] || 'Estado no disponible'}</p>
        <p className="mt-1 text-sm text-muted-foreground">{sub.cancel_at && sub.has_subscription
          ? `No se renovará. Tu acceso continúa hasta el ${date(sub.cancel_at)}.`
          : sub.has_subscription && sub.expires_at ? `${sub.subscription_status === 'trialing' ? 'La prueba finaliza' : 'Próxima renovación'} el ${date(sub.expires_at)}.`
          : sub.subscription_status === 'canceled' ? `Tu suscripción finalizó${sub.canceled_at ? ` el ${date(sub.canceled_at)}` : ''}.`
          : sub.subscription_status === 'none' ? 'No tenés una suscripción contratada en Stripe.' : 'Revisá tu facturación en el portal de Stripe.'}</p>
        {sub.has_customer && <StripePortalActions sub={sub} />}
        <Button variant="ghost" className="mt-4 sm:ml-2" disabled={query.isFetching} onClick={() => query.refetch()}>{query.isFetching ? 'Actualizando...' : 'Actualizar estado'}</Button>
      </>}

    </section>
  );
}