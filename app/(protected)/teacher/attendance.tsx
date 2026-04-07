import { useEffect, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button, Searchbar, SegmentedButtons, Switch, Text, TextInput } from 'react-native-paper';
import { GlassCard } from '../../../src/components/ui/glass-card';
import { ActionButton } from '../../../src/components/ui/action-button';
import { HeroBanner, InfoBadge, InlineMetric, SectionBlock, EmptyState } from '../../../src/components/ui/enterprise';
import { Screen } from '../../../src/components/ui/screen';
import { StatusPill } from '../../../src/components/ui/status-pill';
import {
  useTeacherAttendanceSessions,
  useSubmitAttendance,
  useTeacherAttendanceWorkspace,
  useTeacherRoster,
} from '../../../src/features/attendance/use-teacher-attendance';
import { useFeedback } from '../../../src/providers/feedback-provider';

type AttendanceValue = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

const inputStyle = { backgroundColor: 'rgba(7, 17, 29, 0.68)' } as const;

export default function TeacherAttendanceScreen() {
  const workspace = useTeacherAttendanceWorkspace();
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | undefined>();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [slotNumber, setSlotNumber] = useState(1);
  const [search, setSearch] = useState('');
  const [records, setRecords] = useState<Record<string, AttendanceValue>>({});
  const submitAttendance = useSubmitAttendance();
  const { showNotice } = useFeedback();

  const assignments = workspace.data?.assignments ?? [];
  const selectedAssignment = useMemo(
    () => assignments.find((assignment: any) => assignment.id === selectedAssignmentId) ?? assignments[0],
    [assignments, selectedAssignmentId],
  );

  const roster = useTeacherRoster(selectedAssignment?.sectionId);
  const sessions = useTeacherAttendanceSessions(selectedAssignment?.sectionId, selectedAssignment?.subjectId, date);
  const selectedSession = useMemo(
    () => sessions.data?.find((session: any) => session.slotNumber === slotNumber),
    [sessions.data, slotNumber],
  );

  useEffect(() => {
    if (!selectedAssignmentId && assignments[0]?.id) {
      setSelectedAssignmentId(assignments[0].id);
    }
  }, [assignments, selectedAssignmentId]);

  useEffect(() => {
    if (!roster.data?.students) {
      return;
    }

    setRecords(() => {
      const next: Record<string, AttendanceValue> = {};
      for (const student of roster.data.students) {
        next[student.id] = 'PRESENT';
      }

      for (const record of selectedSession?.records ?? []) {
        next[record.studentId] = record.status as AttendanceValue;
      }

      return next;
    });
  }, [roster.data?.students, selectedSession]);

  const summary = useMemo(() => {
    const values = Object.values(records);
    return {
      total: values.length,
      present: values.filter((value) => value === 'PRESENT').length,
      absent: values.filter((value) => value === 'ABSENT').length,
      late: values.filter((value) => value === 'LATE').length,
      excused: values.filter((value) => value === 'EXCUSED').length,
    };
  }, [records]);

  const filteredStudents = useMemo(
    () =>
      (roster.data?.students ?? []).filter((student: any) => {
        const query = search.trim().toLowerCase();

        if (!query) {
          return true;
        }

        return (
          `${student.firstName} ${student.lastName}`.toLowerCase().includes(query) ||
          String(student.rollNumber ?? '').toLowerCase().includes(query) ||
          String(student.usn ?? '').toLowerCase().includes(query)
        );
      }),
    [roster.data?.students, search],
  );
  const rosterStudents = roster.data?.students ?? [];
  const hasAssignments = assignments.length > 0;
  const hasRoster = rosterStudents.length > 0;

  const markAll = (status: AttendanceValue) => {
    if (!roster.data?.students?.length) {
      return;
    }

    const next: Record<string, AttendanceValue> = {};
    for (const student of roster.data.students) {
      next[student.id] = status;
    }
    setRecords(next);
  };

  const submit = async () => {
    if (!selectedAssignment || !roster.data?.students?.length) {
      showNotice({
        title: 'Attendance not ready',
        message: 'Choose a teaching slot with students before submitting attendance.',
        tone: 'error',
      });
      return;
    }

    try {
      await submitAttendance.mutateAsync({
        sectionId: selectedAssignment.sectionId,
        subjectId: selectedAssignment.subjectId,
        date,
        slotNumber,
        hourLabel: `Hour ${slotNumber}`,
        records: roster.data.students.map((student: any) => ({
          studentId: student.id,
          status: records[student.id] ?? 'PRESENT',
        })),
      });
      showNotice({
        title: selectedSession ? 'Attendance updated' : 'Attendance submitted',
        message: `Hour ${slotNumber} attendance has been saved successfully.`,
        tone: 'success',
      });
    } catch {
      showNotice({
        title: 'Attendance failed',
        message: 'We could not save attendance right now.',
        tone: 'error',
      });
    }
  };

  return (
    <Screen>
      <HeroBanner
        eyebrow="Attendance"
        title="Run attendance with less friction and better classroom visibility."
        description="Switch between assigned classes, review the live roster, and post hour-wise attendance from one clean mobile workflow."
        aside={<StatusPill label={selectedSession ? 'ACTIVE' : 'Fresh'} />}
      />

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <InfoBadge label="Subject" value={selectedAssignment?.subjectName ?? '--'} />
        </View>
        <View style={{ flex: 1 }}>
          <InfoBadge label="Section" value={selectedAssignment ? `${selectedAssignment.className} ${selectedAssignment.sectionName}` : '--'} />
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
        <View style={{ flex: 1 }}>
          <InfoBadge label="Date" value={date} />
        </View>
        <View style={{ flex: 1 }}>
          <InfoBadge label="Hour" value={`H${slotNumber}`} />
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
        <View style={{ flex: 1 }}>
          <GlassCard>
            <Text variant="labelMedium" style={{ color: '#8aa6c1' }}>Class strength</Text>
            <Text variant="headlineSmall" style={{ color: '#f7fbff', marginTop: 6, fontWeight: '700' }}>
              {summary.total}
            </Text>
          </GlassCard>
        </View>
        <View style={{ flex: 1 }}>
          <GlassCard>
            <Text variant="labelMedium" style={{ color: '#8aa6c1' }}>Recorded now</Text>
            <Text variant="headlineSmall" style={{ color: '#bae6fd', marginTop: 6, fontWeight: '700' }}>
              {selectedSession?.records?.length ?? 0}
            </Text>
          </GlassCard>
        </View>
      </View>

      <SectionBlock
        title="Teaching filters"
        subtitle="Keep class, subject, date, and hour visible before you start marking."
      >
        {hasAssignments ? (
          <SegmentedButtons
            value={selectedAssignment?.id ?? ''}
            onValueChange={setSelectedAssignmentId}
            buttons={assignments.slice(0, 4).map((assignment: any) => ({
              value: assignment.id,
              label: `${assignment.className} ${assignment.sectionName}`,
            }))}
          />
        ) : (
          <EmptyState
            title="No assigned class found"
            description="This teacher account does not have a section and subject assignment yet, so no student roster can be shown for attendance."
          />
        )}

        <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
          <TextInput label="Attendance date" value={date} onChangeText={setDate} mode="outlined" style={[{ flex: 1 }, inputStyle]} />
          <TextInput
            label="Subject"
            value={selectedAssignment?.subjectName ?? ''}
            editable={false}
            mode="outlined"
            style={[{ flex: 1 }, inputStyle]}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingTop: 16 }}>
          {Array.from({ length: 7 }, (_, index) => {
            const hour = index + 1;
            const isSelected = hour === slotNumber;
            return (
              <Button
                key={hour}
                mode={isSelected ? 'contained' : 'outlined'}
                onPress={() => setSlotNumber(hour)}
                buttonColor={isSelected ? '#7dd3fc' : 'transparent'}
                textColor={isSelected ? '#031221' : '#f7fbff'}
              >
                Hour {hour}
              </Button>
            );
          })}
        </ScrollView>

        <GlassCard style={{ marginTop: 16, padding: 16, borderRadius: 24, backgroundColor: 'rgba(7, 17, 29, 0.68)' }}>
          <Text variant="labelLarge" style={{ color: '#7dd3fc' }}>Session state</Text>
          <Text variant="titleMedium" style={{ color: '#f7fbff', marginTop: 8, fontWeight: '700' }}>
            {selectedSession ? 'Existing hour loaded for review' : 'Ready for fresh attendance'}
          </Text>
          <Text variant="bodyMedium" style={{ color: '#90a9c2', marginTop: 6 }}>
            {selectedSession
              ? `${selectedSession.records.length} records were already posted for this period and can be updated safely.`
              : 'All students start as present, and you can quickly adjust exceptions before saving.'}
          </Text>
        </GlassCard>
      </SectionBlock>

      {!hasAssignments ? (
        <SectionBlock
          title="Student roster"
          subtitle="Students will appear here once a class and subject are assigned to this teacher."
        >
          <EmptyState
            title="Roster unavailable"
            description="Assign this teacher to a section from the admin academic workspace, then come back to mark present or absent for each student."
          />
        </SectionBlock>
      ) : !hasRoster ? (
        <SectionBlock
          title="Student roster"
          subtitle="The selected teaching slot is active, but no student list is available yet."
        >
          <EmptyState
            title="No students loaded for this section"
            description="The selected section has no linked students, or the roster data has not been configured yet. Once students are assigned to the section, they will appear here for attendance marking."
          />
        </SectionBlock>
      ) : null}

      <SectionBlock
        title="Class summary"
        subtitle="Mark students as present or absent quickly, then review the count before submitting."
        action={<StatusPill label={selectedSession ? 'ACTIVE' : 'PENDING'} />}
      >
        <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
          <InlineMetric label="Present" value={String(summary.present)} tone="positive" />
          <InlineMetric label="Absent" value={String(summary.absent)} tone="warning" />
          <InlineMetric label="Late" value={String(summary.late)} />
          <InlineMetric label="Excused" value={String(summary.excused)} />
        </View>
        <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
          <ActionButton label="Mark All Present" icon="check-circle-outline" variant="primary" size="small" onPress={() => markAll('PRESENT')} />
          <ActionButton label="Mark All Absent" icon="close-circle-outline" variant="secondary" size="small" onPress={() => markAll('ABSENT')} />
          <ActionButton label="Mark All Late" icon="clock-alert-outline" variant="ghost" size="small" onPress={() => markAll('LATE')} />
        </View>
      </SectionBlock>

      <Searchbar
        placeholder="Search by student name, USN, or roll number"
        value={search}
        onChangeText={setSearch}
        style={{ marginBottom: 16, backgroundColor: 'rgba(10, 20, 33, 0.92)' }}
        inputStyle={{ color: '#f7fbff' }}
      />

      {hasRoster && filteredStudents.length ? (
        filteredStudents.map((student: any, index: number) => (
          <GlassCard key={student.id} style={{ marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text variant="labelMedium" style={{ color: '#7f98b3' }}>Student {index + 1}</Text>
                <Text variant="titleMedium" style={{ color: '#f7fbff', marginTop: 4, fontWeight: '700' }}>
                  {student.firstName} {student.lastName}
                </Text>
                <Text variant="bodySmall" style={{ color: '#90a9c2', marginTop: 6 }}>
                  USN {student.usn ?? '--'} | Roll {student.rollNumber ?? '--'}
                </Text>
              </View>
              <StatusPill label={records[student.id] ?? 'PRESENT'} />
            </View>
            <View
              style={{
                marginTop: 14,
                borderRadius: 22,
                borderWidth: 1,
                borderColor: 'rgba(109, 145, 176, 0.14)',
                backgroundColor: 'rgba(7, 17, 29, 0.6)',
                padding: 14,
              }}
            >
              <Text variant="labelLarge" style={{ color: '#8aa6c1' }}>
                Attendance status
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text variant="titleSmall" style={{ color: '#f7fbff', fontWeight: '700' }}>
                    {records[student.id] === 'ABSENT' ? 'Absent' : 'Present'}
                  </Text>
                  <Text variant="bodySmall" style={{ color: '#90a9c2', marginTop: 4 }}>
                    Toggle this switch to mark the student absent. Leave it on for present.
                  </Text>
                </View>
                <Switch
                  value={(records[student.id] ?? 'PRESENT') !== 'ABSENT'}
                  onValueChange={(value) =>
                    setRecords((current) => ({
                      ...current,
                      [student.id]: value ? 'PRESENT' : 'ABSENT',
                    }))
                  }
                />
              </View>
              <SegmentedButtons
                value={records[student.id] ?? 'PRESENT'}
                onValueChange={(value) =>
                  setRecords((current) => ({
                    ...current,
                    [student.id]: value as AttendanceValue,
                  }))
                }
                style={{ marginTop: 14 }}
                buttons={[
                  { value: 'PRESENT', label: 'Present' },
                  { value: 'ABSENT', label: 'Absent' },
                ]}
              />
            </View>
          </GlassCard>
        ))
      ) : hasRoster ? (
        <EmptyState title="No students match this search" description="Try a different name, roll number, or USN to find the student quickly." />
      ) : null}

      <SectionBlock title="Recent attendance activity" subtitle="A quick history of recently posted sessions for your assigned classes.">
        {(workspace.data?.recentSessions ?? []).length ? (
          (workspace.data?.recentSessions ?? []).slice(0, 4).map((session: any) => (
            <View
              key={session.id}
              style={{
                marginBottom: 12,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: 'rgba(109, 145, 176, 0.14)',
                backgroundColor: 'rgba(7, 17, 29, 0.56)',
                padding: 14,
              }}
            >
              <Text variant="titleSmall" style={{ color: '#f7fbff', fontWeight: '700' }}>
                {session.subjectName}
              </Text>
              <Text variant="bodySmall" style={{ color: '#90a9c2', marginTop: 4 }}>
                {session.sectionName} | {new Date(session.date).toLocaleDateString()} | {session.hourLabel ?? `Hour ${session.slotNumber ?? '--'}`}
              </Text>
              <Text variant="bodySmall" style={{ color: '#90a9c2', marginTop: 4 }}>
                {session.submissions} submissions captured
              </Text>
            </View>
          ))
        ) : (
          <EmptyState title="No recent sessions yet" description="Once attendance is posted, the latest section activity will appear here for quick reference." />
        )}
      </SectionBlock>

      <GlassCard style={{ marginTop: 4 }}>
        <Text variant="titleMedium" style={{ color: '#f7fbff', fontWeight: '700' }}>
          Submit this class hour
        </Text>
        <Text variant="bodyMedium" style={{ color: '#90a9c2', marginTop: 6 }}>
          Review the summary above, then save the current roster state for {selectedAssignment?.subjectName ?? 'the selected subject'}.
        </Text>
        <ActionButton
          label={selectedSession ? 'Update Attendance' : 'Submit Attendance'}
          icon="content-save-outline"
          variant="primary"
          fullWidth
          style={{ marginTop: 16 }}
          onPress={() => void submit()}
          loading={submitAttendance.isPending}
          disabled={submitAttendance.isPending}
        />
      </GlassCard>
    </Screen>
  );
}
