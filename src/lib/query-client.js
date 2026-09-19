import { QueryClient } from '@tanstack/react-query';

export const queryClientInstance = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,          // datos frescos por 5 min — evita refetches innecesarios
      gcTime: 30 * 60 * 1000,            // mantiene cache 30 min en memoria
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,           // re-fetcha al volver online
      retry: (failureCount, error) => {
        // No reintentar si estamos offline (inútil) ni en errores 4xx
        if (!navigator.onLine) return false;
        if (error?.status >= 400 && error?.status < 500) return false;
        return failureCount < 2;
      },
      networkMode: 'offlineFirst',        // sirve cache aunque no haya red
    },
    mutations: {
      networkMode: 'offlineFirst',
      retry: false,
    },
  },
});