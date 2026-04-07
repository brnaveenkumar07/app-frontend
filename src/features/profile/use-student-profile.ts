import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/auth-store';

export function useStudentProfile() {
  const session = useAuthStore((state) => state.session);

  return useQuery({
    queryKey: ['student-profile'],
    enabled: Boolean(session?.accessToken),
    queryFn: async () => {
      const { data } = await api.get('/students/me', {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });

      return data;
    },
  });
}
