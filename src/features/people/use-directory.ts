import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/auth-store';

export function useStudentsDirectory(search?: string) {
  const session = useAuthStore((state) => state.session);

  return useQuery({
    queryKey: ['students-directory', search],
    enabled: Boolean(session?.accessToken),
    queryFn: async () => {
      const { data } = await api.get('/students', {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
        params: { search },
      });

      return data;
    },
  });
}

export function useTeachersDirectory(search?: string) {
  const session = useAuthStore((state) => state.session);

  return useQuery({
    queryKey: ['teachers-directory', search],
    enabled: Boolean(session?.accessToken),
    queryFn: async () => {
      const { data } = await api.get('/teachers', {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
        params: { search },
      });

      return data;
    },
  });
}

export function useCreateStudent() {
  const session = useAuthStore((state) => state.session);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await api.post('/students', payload, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });

      return data;
    },
    onSuccess: () => {
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: ['students-directory'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'admin'] }),
      ]);
    },
  });
}

export function useUpdateStudent() {
  const session = useAuthStore((state) => state.session);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & Record<string, unknown>) => {
      const { data } = await api.patch(`/students/${id}`, payload, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });

      return data;
    },
    onSuccess: () => {
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: ['students-directory'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'admin'] }),
      ]);
    },
  });
}

export function useDeleteStudent() {
  const session = useAuthStore((state) => state.session);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/students/${id}`, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });

      return data;
    },
    onSuccess: () => {
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: ['students-directory'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'admin'] }),
      ]);
    },
  });
}

export function useCreateTeacher() {
  const session = useAuthStore((state) => state.session);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await api.post('/teachers', payload, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });

      return data;
    },
    onSuccess: () => {
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: ['teachers-directory'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-academics-overview'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'admin'] }),
      ]);
    },
  });
}

export function useUpdateTeacher() {
  const session = useAuthStore((state) => state.session);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & Record<string, unknown>) => {
      const { data } = await api.patch(`/teachers/${id}`, payload, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });

      return data;
    },
    onSuccess: () => {
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: ['teachers-directory'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-academics-overview'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'admin'] }),
      ]);
    },
  });
}

export function useDeleteTeacher() {
  const session = useAuthStore((state) => state.session);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/teachers/${id}`, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });

      return data;
    },
    onSuccess: () => {
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: ['teachers-directory'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-academics-overview'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'admin'] }),
      ]);
    },
  });
}
