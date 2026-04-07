import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { Screen } from '../../../src/components/ui/screen';
import { GlassCard } from '../../../src/components/ui/glass-card';
import { SectionTitle } from '../../../src/components/ui/section-title';
import { StatCard } from '../../../src/components/ui/stat-card';
import { StatusPill } from '../../../src/components/ui/status-pill';
import { useStudentAttendance } from '../../../src/features/attendance/use-student-attendance';
import { useDashboard } from '../../../src/features/dashboard/use-dashboard';
import { useStudentPerformanceSummary } from '../../../src/features/performance/use-performance';
import { signOut } from '../../../src/lib/api';
import { useFeedback } from '../../../src/providers/feedback-provider';

export default function StudentDashboardScreen() {
  const router = useRouter();
  const { showNotice } = useFeedback();
  const dashboard = useDashboard('student');
  const attendance = useStudentAttendance();
  const performance = useStudentPerformanceSummary();

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
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text variant="headlineLarge" style={{ color: '#f7fbff' }}>
            Student cockpit
          </Text>
          <Text variant="bodyLarge" style={{ color: '#8ba0bf', marginTop: 8 }}>
            Attendance, marks, timetable, announcements, and alerts in one engineering-academic workspace.
          </Text>
        </View>
        <Button mode="contained-tonal" onPress={() => void handleLogout()}>
          Logout
        </Button>
      </View>

      <GlassCard style={{ marginBottom: 16 }}>
        <Text variant="labelLarge" style={{ color: '#8ba0bf' }}>
          Welcome back
        </Text>
        <Text variant="headlineSmall" style={{ color: '#f7fbff', marginTop: 10 }}>
          {dashboard.data?.student?.name ?? 'Student'}
        </Text>
        <Text variant="bodyMedium" style={{ color: '#8ba0bf', marginTop: 8 }}>
          {dashboard.data?.student?.departmentName ?? 'Department pending'} | Sem {dashboard.data?.student?.currentSemester ?? '--'} | Section {dashboard.data?.student?.sectionName ?? '--'}
        </Text>
        <Text variant="bodyMedium" style={{ color: '#8ba0bf', marginTop: 4 }}>
          USN {dashboard.data?.student?.usn ?? '--'} | Roll {dashboard.data?.student?.rollNumber ?? '--'} | {dashboard.data?.student?.className ?? '--'}
        </Text>
      </GlassCard>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <StatCard
            label="Attendance"
            value={`${attendance.data?.summary?.attendancePercentage ?? '--'}%`}
            caption={attendance.data?.summary?.isBelowThreshold ? 'Attention required' : 'On track'}
            icon={<MaterialCommunityIcons name="calendar-check-outline" size={22} color="#7dd3fc" />}
          />
        </View>
        <View style={{ flex: 1 }}>
          <StatCard
            label="Overall score"
            value={`${performance.data?.summary?.overallPercentage ?? '--'}%`}
            icon={<MaterialCommunityIcons name="chart-line" size={22} color="#c084fc" />}
          />
        </View>
      </View>

      <SectionTitle title="Recent attendance" subtitle="Latest class statuses." />
      <GlassCard style={{ marginBottom: 18 }}>
        {dashboard.data?.recentAttendance?.map((record: any) => (
          <View
            key={record.id}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}
          >
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text variant="titleSmall" style={{ color: '#f7fbff' }}>
                {record.subject}
              </Text>
            </View>
            <StatusPill label={record.status} />
          </View>
        ))}
      </GlassCard>

      <SectionTitle title="Recent marks" subtitle="Most recent uploaded assessments." />
      <GlassCard>
        {dashboard.data?.recentMarks?.map((mark: any) => (
          <View key={mark.id} style={{ marginBottom: 12 }}>
            <Text variant="titleSmall" style={{ color: '#f7fbff' }}>
              {mark.title}
            </Text>
            <Text variant="bodySmall" style={{ color: '#8ba0bf', marginTop: 4 }}>
              {mark.subject} | {Number(mark.marksObtained)}/{Number(mark.maxMarks)} | Grade {mark.grade ?? '--'}
            </Text>
          </View>
        ))}
      </GlassCard>
    </Screen>
  );
}
