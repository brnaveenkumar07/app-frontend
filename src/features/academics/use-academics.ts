import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/auth-store';

export function useAdminAcademicsOverview() {
  const session = useAuthStore((state) => state.session);

  return useQuery({
    queryKey: ['admin-academics-overview'],
    enabled: Boolean(session?.accessToken),
    queryFn: async () => {
      const { data } = await api.get('/academics/admin/overview', {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });

      return data;
    },
  });
}

export function useStudentTimetable() {
  const session = useAuthStore((state) => state.session);

  return useQuery({
    queryKey: ['student-timetable'],
    enabled: Boolean(session?.accessToken),
    queryFn: async () => {
      const { data } = await api.get('/academics/student/timetable', {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });

      return data;
    },
  });
}

export function useSchools() {
  const session = useAuthStore((state) => state.session);

  return useQuery({
    queryKey: ['schools'],
    enabled: Boolean(session?.accessToken),
    queryFn: async () => {
      const { data } = await api.get('/schools', {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });

      return data;
    },
  });
}

function useAdminMutation() {
  const session = useAuthStore((state) => state.session);
  const queryClient = useQueryClient();

  return {
    session,
    invalidate: () => {
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-academics-overview'] }),
        queryClient.invalidateQueries({ queryKey: ['schools'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'admin'] }),
      ]);
    },
  };
}

export function useCreateSchool() {
  const { session, invalidate } = useAdminMutation();

  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await api.post('/schools', payload, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });

      return data;
    },
    onSuccess: invalidate,
  });
}

export function useUpdateSchool() {
  const { session, invalidate } = useAdminMutation();

  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & Record<string, unknown>) => {
      const { data } = await api.patch(`/schools/${id}`, payload, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });

      return data;
    },
    onSuccess: invalidate,
  });
}

export function useDeleteSchool() {
  const { session, invalidate } = useAdminMutation();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/schools/${id}`, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });

      return data;
    },
    onSuccess: invalidate,
  });
}

function createAdminEntityMutation(path: string, method: 'post' | 'patch' | 'delete') {
  return function useEntityMutation() {
    const { session, invalidate } = useAdminMutation();

    return useMutation({
      mutationFn: async (payload: any) => {
        if (method === 'post') {
          const { data } = await api.post(path, payload, {
            headers: { Authorization: `Bearer ${session?.accessToken}` },
          });
          return data;
        }

        if (method === 'patch') {
          const { id, ...body } = payload;
          const { data } = await api.patch(`${path}/${id}`, body, {
            headers: { Authorization: `Bearer ${session?.accessToken}` },
          });
          return data;
        }

        const { data } = await api.delete(`${path}/${payload}`, {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        });
        return data;
      },
      onSuccess: invalidate,
    });
  };
}

export const useCreateAcademicClass = createAdminEntityMutation('/academics/admin/classes', 'post');
export const useUpdateAcademicClass = createAdminEntityMutation('/academics/admin/classes', 'patch');
export const useDeleteAcademicClass = createAdminEntityMutation('/academics/admin/classes', 'delete');
export const useCreateDepartment = createAdminEntityMutation('/academics/admin/departments', 'post');
export const useUpdateDepartment = createAdminEntityMutation('/academics/admin/departments', 'patch');
export const useDeleteDepartment = createAdminEntityMutation('/academics/admin/departments', 'delete');
export const useCreateSection = createAdminEntityMutation('/academics/admin/sections', 'post');
export const useUpdateSection = createAdminEntityMutation('/academics/admin/sections', 'patch');
export const useDeleteSection = createAdminEntityMutation('/academics/admin/sections', 'delete');
export const useCreateSubject = createAdminEntityMutation('/academics/admin/subjects', 'post');
export const useUpdateSubject = createAdminEntityMutation('/academics/admin/subjects', 'patch');
export const useDeleteSubject = createAdminEntityMutation('/academics/admin/subjects', 'delete');
export const useCreateAcademicYear = createAdminEntityMutation('/academics/admin/academic-years', 'post');
export const useUpdateAcademicYear = createAdminEntityMutation('/academics/admin/academic-years', 'patch');
export const useDeleteAcademicYear = createAdminEntityMutation('/academics/admin/academic-years', 'delete');
export const useCreateSemester = createAdminEntityMutation('/academics/admin/semesters', 'post');
export const useUpdateSemester = createAdminEntityMutation('/academics/admin/semesters', 'patch');
export const useDeleteSemester = createAdminEntityMutation('/academics/admin/semesters', 'delete');
export const useCreateTerm = createAdminEntityMutation('/academics/admin/terms', 'post');
export const useUpdateTerm = createAdminEntityMutation('/academics/admin/terms', 'patch');
export const useDeleteTerm = createAdminEntityMutation('/academics/admin/terms', 'delete');
export const useCreateSubjectOffering = createAdminEntityMutation('/academics/admin/subject-offerings', 'post');
export const useUpdateSubjectOffering = createAdminEntityMutation('/academics/admin/subject-offerings', 'patch');
export const useDeleteSubjectOffering = createAdminEntityMutation('/academics/admin/subject-offerings', 'delete');
export const useCreateInternalMarksPolicy = createAdminEntityMutation('/academics/admin/internal-marks-policies', 'post');
export const useUpdateInternalMarksPolicy = createAdminEntityMutation('/academics/admin/internal-marks-policies', 'patch');
export const useDeleteInternalMarksPolicy = createAdminEntityMutation('/academics/admin/internal-marks-policies', 'delete');
export const useCreateTeacherAssignment = createAdminEntityMutation('/academics/admin/assignments', 'post');
export const useUpdateTeacherAssignment = createAdminEntityMutation('/academics/admin/assignments', 'patch');
export const useDeleteTeacherAssignment = createAdminEntityMutation('/academics/admin/assignments', 'delete');
export const useCreateTimetableEntry = createAdminEntityMutation('/academics/admin/timetable', 'post');
export const useUpdateTimetableEntry = createAdminEntityMutation('/academics/admin/timetable', 'patch');
export const useDeleteTimetableEntry = createAdminEntityMutation('/academics/admin/timetable', 'delete');
