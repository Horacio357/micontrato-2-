import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import StripePortalActions from '@/components/account/StripePortalActions';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const labels = { none: 'Sin suscripción', active: 'Activa', trialing: 'En período de prueba', past_due: 'Pago pendiente', unpaid: 'Impaga', canceled: 'Cancelada', incomplete: 'Pago inicial pendiente', incomplete_expired: 'Pago inicial vencido', paused: 'Pausada' };
const date = (value) => new Date(value).toLocaleDateString('es-AR');

export default function SubscriptionPanel() {
  const queryClient = useQueryClient();
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async () => {
    setSubscribing(true);
    try {
      const res = await base44.functions.invoke('createStripeCheckout', { type: 'subscription' });
      if (res.data?.url) {
        window.location.href = res.data.url;
        return;
      }
      toast.error('No se pudo generar la sesión de pago.');
      setSubscribing(false);
    } catch (err) {
      toast.error(err.message || 'Error al iniciar suscripción con Stripe');
      setSubscribing(false);
    }
  };

  const query = useQuery({ queryKey: ['subscription-status'], queryFn: async () => {
    const { data } = await base44.functions.invoke('syncSubscriptionStatus', {});
    if (data.error) throw new Error(data.error);
    queryClient.invalidateQueries({ queryKey: ['me'] });
    return data;
  }, refetchOnWindowFocus: 'always', staleTime: 0, retry: false });

  const sub = query.data;

  return (
    <section className="mb-10 rounded-xl border border-border bg-card p-6 shadow-sm" aria-labelledby="subscription-title">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 id="subscription-title" className="text-lg font-bold text-foreground">Mi suscripción</h2>
          {query.isLoading ? (
            <p className="mt-2 text-sm text-muted-foreground" role="status">Consultando estado en Stripe...</p>
          ) : query.isError ? (
            <div role="alert" className="mt-2">
              <p className="text-sm text-destructive">No pudimos consultar tu suscripción. Intentá nuevamente.</p>
              <Button variant="outline" size="sm" className="mt-3" disabled={query.isFetching} onClick={() => query.refetch()}>Reintentar</Button>
            </div>
          ) : sub && (
            <>
              <p className="mt-1 font-semibold text-foreground">
                {sub.cancel_at && sub.has_subscription ? 'Cancelación programada' : labels[sub.subscription_status] || 'Estado no disponible'}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {sub.cancel_at && sub.has_subscription
                  ? `No se renovará. Tu acceso continúa hasta el ${date(sub.cancel_at)}.`
                  : sub.has_subscription && sub.expires_at ? `${sub.subscription_status === 'trialing' ? 'La prueba finaliza' : 'Próxima renovación'} el ${date(sub.expires_at)}.`
                  : sub.subscription_status === 'canceled' ? `Tu suscripción finalizó${sub.canceled_at ? ` el ${date(sub.canceled_at)}` : ''}.`
                  : sub.subscription_status === 'none' ? 'No tenés una suscripción activa. Suscribite para acceder a contratos ilimitados.' : 'Revisá tu facturación en el portal de Stripe.'}
              </p>
            </>
          )}
        </div>

        {sub && !sub.has_subscription && (
          <Button
            onClick={handleSubscribe}
            disabled={subscribing}
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold shrink-0 gap-2 shadow-sm"
          >
            {subscribing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Suscribirme al Plan Pro ($9.990 ARS/mes)
          </Button>
        )}
      </div>

      {sub && sub.has_customer && (
        <div className="mt-4 pt-4 border-t border-border">
          <StripePortalActions sub={sub} />
        </div>
      )}

      {sub && (
        <div className="mt-4 flex items-center">
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground" disabled={query.isFetching} onClick={() => query.refetch()}>
            {query.isFetching ? 'Actualizando...' : 'Actualizar estado'}
          </Button>
        </div>
      )}
    </section>
  );
}