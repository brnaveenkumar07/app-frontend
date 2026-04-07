import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { GlassCard } from '../../../src/components/ui/glass-card';
import { Screen } from '../../../src/components/ui/screen';
import { SectionTitle } from '../../../src/components/ui/section-title';
import { useStudentTimetable } from '../../../src/features/academics/use-academics';
import { useStudentProfile } from '../../../src/features/profile/use-student-profile';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function StudentProfileScreen() {
  const profile = useStudentProfile();
  const timetable = useStudentTimetable();

  return (
    <Screen>
      <SectionTitle title="Profile and timetable" subtitle="Personal profile, department identity, and class schedule." />
      <GlassCard style={{ marginBottom: 16 }}>
        <Text variant="headlineSmall" style={{ color: '#f7fbff' }}>
          {profile.data?.firstName} {profile.data?.lastName}
        </Text>
        <Text variant="bodySmall" style={{ color: '#8ba0bf', marginTop: 6 }}>
          {profile.data?.user?.email} | USN {profile.data?.usn ?? '--'}
        </Text>
        <Text variant="bodySmall" style={{ color: '#8ba0bf', marginTop: 4 }}>
          {profile.data?.department?.name ?? profile.data?.section?.department?.name ?? 'Department pending'} | Sem {profile.data?.currentSemester ?? profile.data?.section?.semesterNumber ?? '--'} | Section {profile.data?.section?.name ?? '--'}
        </Text>
        <Text variant="bodySmall" style={{ color: '#8ba0bf', marginTop: 4 }}>
          Guardian: {profile.data?.guardianName ?? '--'} | {profile.data?.guardianPhone ?? '--'}
        </Text>
      </GlassCard>

      <GlassCard>
        <Text variant="titleMedium" style={{ color: '#f7fbff', marginBottom: 12 }}>
          Timetable
        </Text>
        {timetable.data?.timetable?.map((entry: any) => (
          <View key={entry.id} style={{ marginBottom: 12 }}>
            <Text variant="titleSmall" style={{ color: '#f7fbff' }}>
              {DAYS[entry.dayOfWeek - 1] ?? `Day ${entry.dayOfWeek}`} | {entry.periodLabel ?? 'Period'} | {entry.subjectName}
            </Text>
            <Text variant="bodySmall" style={{ color: '#8ba0bf', marginTop: 4 }}>
              {entry.startTime} - {entry.endTime} | {entry.roomLabel ?? 'Room TBA'} | {entry.teacherName ?? 'Faculty assigned'}
            </Text>
          </View>
        ))}
      </GlassCard>
    </Screen>
  );
}
