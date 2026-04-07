import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/auth-store';

export function useNotifications() {
  const session = useAuthStore((state) => state.session);

  return useQuery({
    queryKey: ['notifications'],
    enabled: Boolean(session?.accessToken),
    queryFn: async () => {
      const { data } = await api.get('/notifications/me', {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });

      return data;
    },
  });
}

export function useMarkNotificationRead() {
  const session = useAuthStore((state) => state.session);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { data } = await api.patch(`/notifications/${notificationId}/read`, undefined, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });

      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
