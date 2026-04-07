import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/auth-store';

export function useStudentAttendance(date?: string) {
  const session = useAuthStore((state) => state.session);

  return useQuery({
    queryKey: ['student-attendance', date],
    enabled: Boolean(session?.accessToken),
    queryFn: async () => {
      const { data } = await api.get('/attendance/student/summary', {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
        params: {
          date,
        },
      });
      return data;
    },
  });
}
