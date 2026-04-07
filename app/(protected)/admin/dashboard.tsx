import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { GlassCard } from '../../../src/components/ui/glass-card';
import { Screen } from '../../../src/components/ui/screen';
import { SectionTitle } from '../../../src/components/ui/section-title';
import { StatCard } from '../../../src/components/ui/stat-card';
import { useDashboard } from '../../../src/features/dashboard/use-dashboard';
import { useAdminAcademicsOverview } from '../../../src/features/academics/use-academics';
import { useAdminPerformanceOverview } from '../../../src/features/performance/use-performance';
import { signOut } from '../../../src/lib/api';
import { useFeedback } from '../../../src/providers/feedback-provider';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { showNotice } = useFeedback();
  const { data } = useDashboard('admin');
  const academics = useAdminAcademicsOverview();
  const performance = useAdminPerformanceOverview();

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
            College command center
          </Text>
          <Text variant="bodyLarge" style={{ color: '#8ba0bf', marginTop: 8 }}>
            Oversight for branches, semesters, attendance risk, performance, announcements, and academic setup.
          </Text>
        </View>
        <Button mode="contained-tonal" onPress={() => void handleLogout()}>
          Logout
        </Button>
      </View>

      <GlassCard style={{ marginBottom: 16 }}>
        <Text variant="labelLarge" style={{ color: '#8ba0bf' }}>
          Live institution pulse
        </Text>
        <Text variant="headlineSmall" style={{ color: '#f7fbff', marginTop: 10 }}>
          {data?.metrics?.students ?? '--'} students, {data?.metrics?.teachers ?? '--'} faculty, {data?.metrics?.departments ?? '--'} departments
        </Text>
        <Text variant="bodyMedium" style={{ color: '#8ba0bf', marginTop: 8 }}>
          {academics.data?.semesters?.length ?? 0} semester structures and {academics.data?.subjectOfferings?.length ?? 0} subject offerings currently mapped.
        </Text>
      </GlassCard>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <StatCard
            label="Low attendance"
            value={String(data?.metrics?.lowAttendanceCount ?? '--')}
            icon={<MaterialCommunityIcons name="alert-outline" size={22} color="#fda4af" />}
          />
        </View>
        <View style={{ flex: 1 }}>
          <StatCard
            label="Low performance"
            value={String(data?.metrics?.lowPerformanceCount ?? '--')}
            icon={<MaterialCommunityIcons name="chart-bell-curve-cumulative" size={22} color="#93c5fd" />}
          />
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <StatCard
            label="Policies"
            value={String(academics.data?.internalMarksPolicies?.length ?? '--')}
            icon={<MaterialCommunityIcons name="notebook-edit-outline" size={22} color="#7dd3fc" />}
          />
        </View>
        <View style={{ flex: 1 }}>
          <StatCard
            label="Assessments"
            value={String(performance.data?.stats?.assessmentCount ?? '--')}
            icon={<MaterialCommunityIcons name="file-chart-outline" size={22} color="#c084fc" />}
          />
        </View>
      </View>

      <SectionTitle title="Top performers" subtitle="Quick insight from the current marks ledger." />
      <GlassCard style={{ marginBottom: 18 }}>
        {performance.data?.topStudents?.length ? (
          performance.data.topStudents.map((student: any) => (
            <View
              key={student.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 10,
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(139, 160, 191, 0.08)',
              }}
            >
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text variant="titleMedium" style={{ color: '#f7fbff' }}>
                  {student.name}
                </Text>
                <Text variant="bodySmall" style={{ color: '#8ba0bf', marginTop: 2 }}>
                  {student.rollNumber} | {student.className} {student.sectionName}
                </Text>
              </View>
              <Text variant="titleMedium" style={{ color: '#7dd3fc' }}>
                {student.percentage}%
              </Text>
            </View>
          ))
        ) : (
          <Text style={{ color: '#8ba0bf' }}>No performance records yet.</Text>
        )}
      </GlassCard>

      <SectionTitle title="Recent announcements" subtitle="Broadcast activity across the college." />
      <GlassCard>
        {data?.recentAnnouncements?.length ? (
          data.recentAnnouncements.map((item: any) => (
            <View key={item.id} style={{ marginBottom: 14 }}>
              <Text variant="titleMedium" style={{ color: '#f7fbff' }}>
                {item.title}
              </Text>
              <Text variant="bodySmall" style={{ color: '#8ba0bf', marginTop: 4 }}>
                {item.content}
              </Text>
            </View>
          ))
        ) : (
          <Text style={{ color: '#8ba0bf' }}>No announcements published yet.</Text>
        )}
      </GlassCard>
    </Screen>
  );
}
