import { Button } from '@/components/ui/button';

export default function ContractsLoadError({ retry, isFetching }) {
  return <div role="alert" className="my-5 border border-destructive/30 bg-card p-5">
    <p className="text-sm text-destructive">No pudimos cargar tus contratos. Tus documentos no se eliminaron.</p>
    <Button variant="outline" className="mt-3" disabled={isFetching} onClick={retry}>{isFetching ? 'Cargando...' : 'Reintentar'}</Button>
  </div>;
}