import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/auth-store';

export function useTeacherPerformanceOverview() {
  const session = useAuthStore((state) => state.session);

  return useQuery({
    queryKey: ['teacher-performance-overview'],
    enabled: Boolean(session?.accessToken),
    queryFn: async () => {
      const { data } = await api.get('/performance/teacher/overview', {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });

      return data;
    },
  });
}

export function useTeacherAssessments(sectionId?: string, subjectId?: string) {
  const session = useAuthStore((state) => state.session);

  return useQuery({
    queryKey: ['teacher-assessments', sectionId, subjectId],
    enabled: Boolean(session?.accessToken && subjectId),
    queryFn: async () => {
      const { data } = await api.get('/performance/teacher/assessments', {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
        params: { sectionId, subjectId },
      });

      return data;
    },
  });
}

export function useCreateAssessment() {
  const session = useAuthStore((state) => state.session);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await api.post('/performance/teacher/assessments', payload, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });

      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['teacher-performance-overview'] });
      await queryClient.invalidateQueries({ queryKey: ['teacher-assessments'] });
    },
  });
}

export function useSubmitMarks() {
  const session = useAuthStore((state) => state.session);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await api.post('/performance/teacher/marks', payload, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });

      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['teacher-assessments'] });
      await queryClient.invalidateQueries({ queryKey: ['teacher-performance-overview'] });
      await queryClient.invalidateQueries({ queryKey: ['student-performance-summary'] });
    },
  });
}

export function useCreateStudentRemark() {
  const session = useAuthStore((state) => state.session);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await api.post('/performance/teacher/remarks', payload, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });

      return data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['student-performance-summary'] }),
        queryClient.invalidateQueries({ queryKey: ['teacher-performance-overview'] }),
      ]);
    },
  });
}

export function useStudentPerformanceSummary() {
  const session = useAuthStore((state) => state.session);

  return useQuery({
    queryKey: ['student-performance-summary'],
    enabled: Boolean(session?.accessToken),
    queryFn: async () => {
      const { data } = await api.get('/performance/student/summary', {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });

      return data;
    },
  });
}

export function useAdminPerformanceOverview() {
  const session = useAuthStore((state) => state.session);

  return useQuery({
    queryKey: ['admin-performance-overview'],
    enabled: Boolean(session?.accessToken),
    queryFn: async () => {
      const { data } = await api.get('/performance/admin/overview', {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });

      return data;
    },
  });
}
