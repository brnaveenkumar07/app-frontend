import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/auth-store';

export function useAnnouncements() {
  const session = useAuthStore((state) => state.session);

  return useQuery({
    queryKey: ['announcements'],
    enabled: Boolean(session?.accessToken),
    queryFn: async () => {
      const { data } = await api.get('/announcements', {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });

      return data;
    },
  });
}

export function useCreateAnnouncement() {
  const session = useAuthStore((state) => state.session);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await api.post('/announcements', payload, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });

      return data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['announcements'] }),
        queryClient.invalidateQueries({ queryKey: ['notifications'] }),
      ]);
    },
  });
}
