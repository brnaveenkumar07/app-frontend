import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/auth-store';

export function useDashboard(role: 'admin' | 'teacher' | 'student') {
  const session = useAuthStore((state) => state.session);

  return useQuery({
    queryKey: ['dashboard', role],
    enabled: Boolean(session?.accessToken),
    queryFn: async () => {
      const { data } = await api.get(`/dashboard/${role}`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      return data;
    },
  });
}
