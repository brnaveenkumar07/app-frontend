import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { GlassCard } from '../../../src/components/ui/glass-card';
import { Screen } from '../../../src/components/ui/screen';
import { SectionTitle } from '../../../src/components/ui/section-title';
import { StatCard } from '../../../src/components/ui/stat-card';
import { useTeacherAttendanceWorkspace } from '../../../src/features/attendance/use-teacher-attendance';
import { useDashboard } from '../../../src/features/dashboard/use-dashboard';
import { useTeacherPerformanceOverview } from '../../../src/features/performance/use-performance';
import { signOut } from '../../../src/lib/api';
import { useFeedback } from '../../../src/providers/feedback-provider';

export default function TeacherDashboardScreen() {
  const router = useRouter();
  const { showNotice } = useFeedback();
  const dashboard = useDashboard('teacher');
  const attendance = useTeacherAttendanceWorkspace();
  const performance = useTeacherPerformanceOverview();

  const handleLogout = async () => {
    try {
      await signOut();
      showNotice({
        title: 'Signed out',
        message: 'You can sign back in at any time.',
        tone: 'success',
      });
      router.replace('/(public)/login');
    } catch {
      showNotice({
        title: 'Sign-out issue',
        message: 'We could not complete sign-out cleanly. Please try again.',
        tone: 'error',
      });
    }
  };

  return (
    <Screen>
      <View style={{ marginBottom: 24, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <View style={{ flex: 1, paddingRight: 16 }}>
          <Text variant="headlineLarge" style={{ color: '#f7fbff' }}>
            Teaching workspace
          </Text>
          <Text variant="bodyLarge" style={{ color: '#8ba0bf', marginTop: 8 }}>
            Attendance execution, marks capture, class intelligence, and announcements in one faculty console.
          </Text>
        </View>
        <Button mode="contained-tonal" onPress={() => void handleLogout()}>
          Logout
        </Button>
      </View>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <StatCard
            label="Assignments"
            value={String(performance.data?.stats?.assignments ?? dashboard.data?.stats?.classesHandled ?? '--')}
            icon={<MaterialCommunityIcons name="clipboard-text-outline" size={22} color="#7dd3fc" />}
          />
        </View>
        <View style={{ flex: 1 }}>
          <StatCard
            label="Learners"
            value={String(performance.data?.stats?.studentsCovered ?? '--')}
            icon={<MaterialCommunityIcons name="account-multiple-outline" size={22} color="#c084fc" />}
          />
        </View>
      </View>

      <GlassCard style={{ marginBottom: 18 }}>
        <Text variant="labelLarge" style={{ color: '#8ba0bf' }}>
          Daily momentum
        </Text>
        <Text variant="headlineSmall" style={{ color: '#f7fbff', marginTop: 10 }}>
          {attendance.data?.recentSessions?.length ?? 0} recent attendance sessions tracked
        </Text>
        <Text variant="bodyMedium" style={{ color: '#8ba0bf', marginTop: 8 }}>
          This workspace now carries USN-aware rosters, engineering section context, marks capture, and timetable-linked teaching visibility.
        </Text>
      </GlassCard>

      <SectionTitle title="Assigned classes" subtitle="Your current instructional load." />
      {performance.data?.assignments?.map((assignment: any) => (
        <GlassCard key={assignment.id} style={{ marginBottom: 14 }}>
          <Text variant="titleMedium" style={{ color: '#f7fbff' }}>
            {assignment.className} {assignment.sectionName}
          </Text>
          <Text variant="bodySmall" style={{ color: '#8ba0bf', marginTop: 6 }}>
            {assignment.subjectName} | {assignment.rosterSize} students
          </Text>
        </GlassCard>
      ))}
    </Screen>
  );
}
