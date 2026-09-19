import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

export default function StripePortalActions({ sub }) {
  const [portalUrl, setPortalUrl] = useState('');
  const portal = useMutation({ mutationFn: async ({ action, tab }) => {
    try {
      const { data } = await base44.functions.invoke('createStripeCustomerPortal', { action });
      if (!data.url || data.error) throw new Error(data.error || 'No se pudo abrir Stripe.');
      setPortalUrl(data.url);
      if (tab && !tab.closed) tab.location.replace(data.url);
    } catch (error) {
      if (tab && !tab.closed) tab.close();
      throw error;
    }
  } });
  const openPortal = (action) => {
    setPortalUrl('');
    const tab = window.open('about:blank', '_blank');
    if (tab) tab.opener = null;
    portal.mutate({ action, tab });
  };
  const canCancel = !sub.cancel_at && !sub.cancel_at_period_end && !['none', 'canceled', 'incomplete_expired'].includes(sub.subscription_status);
  return <>
    <p className="mt-3 text-sm text-muted-foreground">Consultá tus facturas y actualizá el medio de pago en Stripe.</p>
    <Button variant="outline" className="mt-4 whitespace-normal h-auto min-h-9" disabled={portal.isPending} onClick={() => openPortal('manage')}>Gestionar facturación</Button>
    {canCancel && <div className="mt-5 border-t border-border pt-4">
      <p className="mb-3 text-sm text-muted-foreground">La confirmación de baja se abre en una nueva pestaña de Stripe. Conservás el acceso hasta finalizar el período abonado; abrirla no cancela tu suscripción.</p>
      <Button variant="destructive" className="whitespace-normal h-auto min-h-9" disabled={portal.isPending} onClick={() => openPortal('cancel')}>Dar de baja la suscripción</Button>
    </div>}
    {portal.isPending && <p className="mt-3 text-sm text-muted-foreground" role="status">Conectando con Stripe...</p>}
    {portalUrl && <p className="mt-3 text-sm">Si Stripe no se abrió, <a href={portalUrl} target="_blank" rel="noopener noreferrer" className="text-accent underline">continuá en Stripe</a>. Al volver, actualizá el estado de tu suscripción.</p>}
    {portal.isError && <p className="mt-3 text-sm text-destructive" role="alert">{portal.error?.response?.data?.error || portal.error.message || 'No se pudo abrir Stripe. Intentá nuevamente.'}</p>}
  </>;
}