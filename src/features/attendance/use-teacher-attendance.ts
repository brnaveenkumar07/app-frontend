import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/auth-store';

type AttendanceRecordPayload = {
  studentId: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  remark?: string;
};

type SubmitAttendancePayload = {
  sectionId: string;
  subjectId: string;
  termId?: string;
  date: string;
  slotNumber: number;
  hourLabel?: string;
  records: AttendanceRecordPayload[];
};

export function useTeacherAttendanceWorkspace() {
  const session = useAuthStore((state) => state.session);

  return useQuery({
    queryKey: ['teacher-attendance-workspace'],
    enabled: Boolean(session?.accessToken),
    queryFn: async () => {
      const { data } = await api.get('/attendance/teacher/workspace', {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });

      return data;
    },
  });
}

export function useTeacherRoster(sectionId?: string) {
  const session = useAuthStore((state) => state.session);

  return useQuery({
    queryKey: ['teacher-roster', sectionId],
    enabled: Boolean(session?.accessToken && sectionId),
    queryFn: async () => {
      const { data } = await api.get('/attendance/teacher/roster', {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
        params: { sectionId },
      });

      return data;
    },
  });
}

export function useTeacherAttendanceSessions(sectionId?: string, subjectId?: string, date?: string) {
  const session = useAuthStore((state) => state.session);

  return useQuery({
    queryKey: ['teacher-attendance-sessions', sectionId, subjectId, date],
    enabled: Boolean(session?.accessToken && sectionId && subjectId && date),
    queryFn: async () => {
      const { data } = await api.get('/attendance/teacher/sessions', {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
        params: { sectionId, subjectId, date },
      });

      return data;
    },
  });
}

export function useSubmitAttendance() {
  const session = useAuthStore((state) => state.session);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SubmitAttendancePayload) => {
      const { data } = await api.post('/attendance/teacher/mark', payload, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });

      return data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['teacher-attendance-workspace'] }),
        queryClient.invalidateQueries({ queryKey: ['teacher-attendance-sessions'] }),
        queryClient.invalidateQueries({ queryKey: ['student-attendance'] }),
      ]);
    },
  });
}
