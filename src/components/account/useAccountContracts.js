import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

function getLocalContracts() {
  try {
    const items = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('contract_')) {
        const parsed = JSON.parse(localStorage.getItem(key));
        if (parsed && parsed.id) items.push(parsed);
      }
    }
    return items;
  } catch {
    return [];
  }
}

export default function useAccountContracts(recent = false) {
  const profile = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });
  const user = profile.data;
  const contracts = useQuery({
    queryKey: ['my-contracts', user?.id, recent ? 'recent' : 'all'],
    queryFn: async () => {
      const apiItems = await base44.entities.GeneratedContract.filter({ created_by_id: user.id }, '-created_at', recent ? 5 : 500).catch(() => []);
      const localItems = getLocalContracts();
      const map = new Map();
      for (const item of [...apiItems, ...localItems]) {
        if (item?.id && !map.has(item.id)) map.set(item.id, item);
      }
      const merged = Array.from(map.values()).sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      return recent ? merged.slice(0, 5) : merged;
    },
    enabled: Boolean(user?.id),
    refetchOnMount: 'always',
  });
  return {
    user, contracts: contracts.data || [],
    isLoading: profile.isPending || (Boolean(user?.id) && contracts.isPending),
    isError: profile.isError || contracts.isError,
    isFetching: profile.isFetching || contracts.isFetching,
    retry: () => profile.isError ? profile.refetch() : contracts.refetch(),
  };
}