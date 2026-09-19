import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function useAccountContracts(recent = false) {
  const profile = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });
  const user = profile.data;
  const contracts = useQuery({
    queryKey: ['my-contracts', user?.id, recent ? 'recent' : 'all'],
    queryFn: () => base44.entities.GeneratedContract.filter({ created_by_id: user.id }, '-created_date', recent ? 5 : 500),
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