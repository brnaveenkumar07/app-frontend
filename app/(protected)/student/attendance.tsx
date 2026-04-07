import { useEffect, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { EmptyState, HeroBanner, InlineMetric, SectionBlock } from '../../../src/components/ui/enterprise';
import { GlassCard } from '../../../src/components/ui/glass-card';
import { Screen } from '../../../src/components/ui/screen';
import { StatCard } from '../../../src/components/ui/stat-card';
import { StatusPill } from '../../../src/components/ui/status-pill';
import { useStudentTimetable } from '../../../src/features/academics/use-academics';
import { useStudentAttendance } from '../../../src/features/attendance/use-student-attendance';

const STATUS_STYLES: Record<string, { accent: string; surface: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }> = {
  PRESENT: {
    accent: '#22c55e',
    surface: 'rgba(34, 197, 94, 0.12)',
    icon: 'check-decagram-outline',
  },
  ABSENT: {
    accent: '#f97316',
    surface: 'rgba(249, 115, 22, 0.12)',
    icon: 'close-circle-outline',
  },
  LATE: {
    accent: '#facc15',
    surface: 'rgba(250, 204, 21, 0.12)',
    icon: 'clock-alert-outline',
  },
  EXCUSED: {
    accent: '#60a5fa',
    surface: 'rgba(96, 165, 250, 0.12)',
    icon: 'shield-check-outline',
  },
  NO_CLASS: {
    accent: '#64748b',
    surface: 'rgba(100, 116, 139, 0.12)',
    icon: 'minus-circle-outline',
  },
  PENDING: {
    accent: '#cbd5e1',
    surface: 'rgba(148, 163, 184, 0.12)',
    icon: 'progress-clock',
  },
};

function formatDisplayDate(date?: string) {
  if (!date) {
    return 'No attendance date yet';
  }

  return new Date(date).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function getAcademicDayOfWeek(date: string) {
  const day = new Date(date).getDay();
  return day === 0 ? 7 : day;
}

function getSlotNumber(periodLabel?: string, fallback = 1) {
  const match = periodLabel?.match(/\d+/);
  if (!match) {
    return fallback;
  }

  return Number(match[0]);
}

type DailySessionView = {
  slotNumber: number;
  periodLabel: string;
  subject: string;
  teacherName: string;
  roomLabel: string;
  startTime: string;
  endTime: string;
  status: string;
  remark?: string;
};

const inputStyle = { backgroundColor: 'rgba(7, 17, 29, 0.68)' } as const;

export default function StudentAttendanceScreen() {
  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  const { data } = useStudentAttendance(selectedDate);
  const timetable = useStudentTimetable();
  const effectiveDate = selectedDate ?? data?.selectedDate ?? new Date().toISOString().slice(0, 10);
  const dailySessions = useMemo<DailySessionView[]>(() => {
    const timeline = data?.dailyTimeline ?? [];
    const scheduledEntries = (timetable.data?.timetable ?? [])
      .filter((entry: any) => entry.dayOfWeek === getAcademicDayOfWeek(effectiveDate))
      .sort((left: any, right: any) => {
        const leftSlot = getSlotNumber(left.periodLabel, 99);
        const rightSlot = getSlotNumber(right.periodLabel, 99);

        if (leftSlot !== rightSlot) {
          return leftSlot - rightSlot;
        }

        return String(left.startTime).localeCompare(String(right.startTime));
      });

    if (scheduledEntries.length === 0) {
      return timeline.map((session: any, index: number) => ({
        slotNumber: session.slotNumber ?? index + 1,
        periodLabel: session.hourLabel ?? `Hour ${session.slotNumber ?? index + 1}`,
        subject: session.subject,
        teacherName: 'Faculty assigned',
        roomLabel: 'Room TBA',
        startTime: '--:--',
        endTime: '--:--',
        status: session.status,
        remark: session.remark,
      }));
    }

    return scheduledEntries.map((entry: any, index: number) => {
      const slotNumber = getSlotNumber(entry.periodLabel, index + 1);
      const matchedSession =
        timeline.find((session: any) => session.slotNumber === slotNumber) ??
        timeline.find((session: any) => session.subject === entry.subjectName);

      return {
        slotNumber,
        periodLabel: entry.periodLabel ?? `Hour ${slotNumber}`,
        subject: entry.subjectName,
        teacherName: entry.teacherName ?? 'Faculty assigned',
        roomLabel: entry.roomLabel ?? 'Room TBA',
        startTime: entry.startTime,
        endTime: entry.endTime,
        status: matchedSession?.status ?? 'PENDING',
        remark: matchedSession?.remark,
      };
    });
  }, [data?.dailyTimeline, effectiveDate, timetable.data?.timetable]);
  const dailyAttended = dailySessions.filter((item: DailySessionView) => item.status === 'PRESENT' || item.status === 'LATE' || item.status === 'EXCUSED').length;
  const recordedHours = dailySessions.filter((item: DailySessionView) => item.status !== 'PENDING').length;
  const scheduledHours = dailySessions.length;
  const dailyPercentage = scheduledHours === 0 ? 0 : Math.round((dailyAttended / scheduledHours) * 100);
  const currentDateIndex = data?.availableDates?.findIndex((value: string) => value === (selectedDate ?? data?.selectedDate)) ?? -1;

  useEffect(() => {
    if (!selectedDate && data?.selectedDate) {
      setSelectedDate(data.selectedDate);
    }
  }, [selectedDate, data?.selectedDate]);

  return (
    <Screen>
      <HeroBanner
        eyebrow="Attendance"
        title="Follow your daily and subject-wise attendance with better clarity."
        description="Move between dates, check class-period status, and understand subject attendance at a glance with a more polished student experience."
        aside={<StatusPill label={data?.summary?.isBelowThreshold ? 'Attention' : 'On Track'} />}
      />

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <StatCard
            label="Overall attendance"
            value={`${data?.summary?.attendancePercentage ?? '--'}%`}
            caption={`Threshold ${data?.summary?.warningThreshold ?? 75}%`}
          />
        </View>
        <View style={{ flex: 1 }}>
          <StatCard
            label="Selected day"
            value={`${dailyPercentage}%`}
            caption={`${dailyAttended} attended of ${scheduledHours} periods`}
          />
        </View>
      </View>

      <SectionBlock title="Date controls" subtitle="Switch days quickly without losing the hourly attendance context.">
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          <Button
            mode="outlined"
            textColor="#dbeafe"
            disabled={currentDateIndex < 0 || currentDateIndex >= (data?.availableDates?.length ?? 0) - 1}
            onPress={() => {
              const nextDate = data?.availableDates?.[currentDateIndex + 1];
              if (nextDate) {
                setSelectedDate(nextDate);
              }
            }}
          >
            Previous
          </Button>
          <TextInput
            label="Attendance date"
            value={selectedDate ?? data?.selectedDate ?? ''}
            onChangeText={setSelectedDate}
            mode="outlined"
            style={[{ flex: 1 }, inputStyle]}
          />
          <Button
            mode="outlined"
            textColor="#dbeafe"
            disabled={currentDateIndex <= 0}
            onPress={() => {
              const nextDate = data?.availableDates?.[currentDateIndex - 1];
              if (nextDate) {
                setSelectedDate(nextDate);
              }
            }}
          >
            Next
          </Button>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingTop: 16 }}>
          {(data?.availableDates ?? []).slice(0, 8).map((date: string) => {
            const isActive = date === (selectedDate ?? data?.selectedDate);
            return (
              <Button
                key={date}
                mode={isActive ? 'contained' : 'outlined'}
                buttonColor={isActive ? '#7dd3fc' : 'transparent'}
                textColor={isActive ? '#031221' : '#f7fbff'}
                onPress={() => setSelectedDate(date)}
              >
                {new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </Button>
            );
          })}
        </ScrollView>
      </SectionBlock>

      <SectionBlock title="Daily register" subtitle="A cleaner classroom timeline for the selected date.">
        <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
          <InlineMetric label="Recorded hours" value={String(recordedHours)} />
          <InlineMetric label="Scheduled hours" value={String(scheduledHours)} />
          <InlineMetric label="Daily score" value={`${dailyPercentage}%`} tone={dailyPercentage >= (data?.summary?.warningThreshold ?? 75) ? 'positive' : 'warning'} />
        </View>

        <GlassCard style={{ marginTop: 16, backgroundColor: 'rgba(7, 17, 29, 0.62)' }}>
          <Text variant="labelLarge" style={{ color: '#7dd3fc' }}>Selected date</Text>
          <Text variant="headlineSmall" style={{ color: '#f7fbff', marginTop: 8, fontWeight: '700' }}>
            {formatDisplayDate(effectiveDate)}
          </Text>
          <Text variant="bodyMedium" style={{ color: '#90a9c2', marginTop: 8 }}>
            {scheduledHours === 0
              ? 'No timetable has been configured for this date yet.'
              : `${scheduledHours} periods were scheduled, with attendance posted for ${recordedHours} of them.`}
          </Text>
        </GlassCard>

        {dailySessions.length ? (
          dailySessions.map((session: DailySessionView) => (
            <View
              key={session.slotNumber}
              style={{
                marginTop: 14,
                borderRadius: 22,
                borderWidth: 1,
                borderColor: 'rgba(73, 102, 132, 0.24)',
                backgroundColor: STATUS_STYLES[session.status]?.surface ?? STATUS_STYLES.PENDING.surface,
                padding: 14,
              }}
            >
              <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
                <View
                  style={{
                    height: 56,
                    width: 56,
                    borderRadius: 18,
                    backgroundColor: 'rgba(8, 19, 32, 0.88)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: 'rgba(73, 102, 132, 0.24)',
                  }}
                >
                  <Text variant="labelLarge" style={{ color: '#8ba0bf' }}>
                    H{session.slotNumber}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="labelLarge" style={{ color: '#8ba0bf' }}>
                    {session.periodLabel}
                  </Text>
                  <Text variant="titleMedium" style={{ color: '#f7fbff', marginTop: 4, fontWeight: '700' }}>
                    {session.subject}
                  </Text>
                  <Text variant="bodySmall" style={{ color: '#8ba0bf', marginTop: 6 }}>
                    {session.startTime} - {session.endTime} | {session.roomLabel}
                  </Text>
                  <Text variant="bodySmall" style={{ color: '#8ba0bf', marginTop: 4 }}>
                    {session.teacherName}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                    <MaterialCommunityIcons
                      name={STATUS_STYLES[session.status]?.icon ?? STATUS_STYLES.PENDING.icon}
                      size={16}
                      color={STATUS_STYLES[session.status]?.accent ?? STATUS_STYLES.PENDING.accent}
                    />
                    <Text variant="bodySmall" style={{ color: '#8ba0bf', marginLeft: 6 }}>
                      {session.status === 'PENDING' ? 'Attendance has not been posted for this scheduled period yet.' : 'Attendance is linked to this subject hour.'}
                    </Text>
                  </View>
                  {session.remark ? (
                    <Text variant="bodySmall" style={{ color: '#8ba0bf', marginTop: 6 }}>
                      {session.remark}
                    </Text>
                  ) : null}
                </View>
                <StatusPill label={session.status} />
              </View>
            </View>
          ))
        ) : (
          <EmptyState title="No classes recorded for this day" description="Choose another date or wait for timetable and attendance data to be published." />
        )}
      </SectionBlock>

      <SectionBlock title="Subject-wise attendance" subtitle="A clearer subject breakdown helps you spot low-attendance risk early.">
        {data?.subjectBreakdown?.length ? (
          data.subjectBreakdown.map((subject: any) => (
            <GlassCard key={subject.subjectId} style={{ marginBottom: 12, backgroundColor: 'rgba(7, 17, 29, 0.58)' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                <Text variant="bodyLarge" style={{ color: '#dbeafe', flex: 1 }}>
                  {subject.subjectName}
                </Text>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text variant="titleMedium" style={{ color: '#7dd3fc', fontWeight: '700' }}>
                    {subject.percentage}%
                  </Text>
                  <Text variant="bodySmall" style={{ color: '#8ba0bf', marginTop: 2 }}>
                    {subject.present}/{subject.total} hours
                  </Text>
                </View>
              </View>
              <View style={{ height: 8, marginTop: 12, borderRadius: 999, backgroundColor: 'rgba(15, 118, 110, 0.18)' }}>
                <View
                  style={{
                    width: `${Math.min(subject.percentage, 100)}%`,
                    height: 8,
                    borderRadius: 999,
                    backgroundColor: subject.percentage < (data?.summary?.warningThreshold ?? 75) ? '#f97316' : '#22c55e',
                  }}
                />
              </View>
            </GlassCard>
          ))
        ) : (
          <EmptyState title="No subject breakdown available" description="Subject-wise attendance will appear here once your attendance records are published." />
        )}
      </SectionBlock>

      <SectionBlock title="Recent records" subtitle="Latest attendance posts across your recent classes.">
        {data?.recentRecords?.length ? (
          data.recentRecords.map((record: any) => (
            <GlassCard key={record.id} style={{ marginBottom: 12, backgroundColor: 'rgba(7, 17, 29, 0.58)' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text variant="titleSmall" style={{ color: '#f7fbff', fontWeight: '700' }}>
                    {record.subject}
                  </Text>
                  <Text variant="bodySmall" style={{ color: '#8ba0bf', marginTop: 6 }}>
                    {new Date(record.date).toLocaleDateString()} | {record.hourLabel ?? `Hour ${record.slotNumber ?? '--'}`}
                  </Text>
                </View>
                <StatusPill label={record.status} />
              </View>
            </GlassCard>
          ))
        ) : (
          <EmptyState title="No recent attendance records" description="Attendance activity will appear here as soon as your classes are marked." />
        )}
      </SectionBlock>
    </Screen>
  );
}
