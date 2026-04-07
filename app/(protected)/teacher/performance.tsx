import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { Searchbar, SegmentedButtons, Text, TextInput } from 'react-native-paper';
import { ActionButton } from '../../../src/components/ui/action-button';
import { EmptyState, FormSection, HeroBanner, InfoBadge, InlineMetric, SectionBlock } from '../../../src/components/ui/enterprise';
import { GlassCard } from '../../../src/components/ui/glass-card';
import { Screen } from '../../../src/components/ui/screen';
import { StatusPill } from '../../../src/components/ui/status-pill';
import { useTeacherRoster } from '../../../src/features/attendance/use-teacher-attendance';
import {
  useCreateAssessment,
  useCreateStudentRemark,
  useSubmitMarks,
  useTeacherAssessments,
  useTeacherPerformanceOverview,
} from '../../../src/features/performance/use-performance';
import { useFeedback } from '../../../src/providers/feedback-provider';

type AssessmentType = 'ASSIGNMENT' | 'QUIZ' | 'MID_EXAM' | 'FINAL_EXAM';

const inputStyle = { backgroundColor: 'rgba(7, 17, 29, 0.68)' } as const;

export default function TeacherPerformanceScreen() {
  const performance = useTeacherPerformanceOverview();
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | undefined>();
  const [assessmentType, setAssessmentType] = useState<AssessmentType>('QUIZ');
  const [title, setTitle] = useState('');
  const [maxMarks, setMaxMarks] = useState('25');
  const [search, setSearch] = useState('');
  const [markValues, setMarkValues] = useState<Record<string, string>>({});
  const [remarkStudentId, setRemarkStudentId] = useState('');
  const [remarkText, setRemarkText] = useState('');
  const createAssessment = useCreateAssessment();
  const submitMarks = useSubmitMarks();
  const createRemark = useCreateStudentRemark();
  const { showNotice } = useFeedback();

  const assignments = performance.data?.assignments ?? [];
  const selectedAssignment = useMemo(
    () => assignments.find((assignment: any) => assignment.id === selectedAssignmentId) ?? assignments[0],
    [assignments, selectedAssignmentId],
  );

  const assessments = useTeacherAssessments(selectedAssignment?.sectionId, selectedAssignment?.subjectId);
  const roster = useTeacherRoster(selectedAssignment?.sectionId);
  const selectedAssessment = assessments.data?.[0];

  useEffect(() => {
    if (!selectedAssignmentId && assignments[0]?.id) {
      setSelectedAssignmentId(assignments[0].id);
    }
  }, [assignments, selectedAssignmentId]);

  useEffect(() => {
    if (!selectedAssessment?.marks?.length) {
      setMarkValues({});
      return;
    }

    const nextValues: Record<string, string> = {};
    for (const mark of selectedAssessment.marks) {
      nextValues[mark.studentId] = String(mark.marksObtained ?? '');
    }
    setMarkValues(nextValues);
  }, [selectedAssessment]);

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

  const marksSummary = useMemo(() => {
    const values = filteredStudents
      .map((student: any) => Number(markValues[student.id] ?? 0))
      .filter((value: number) => Number.isFinite(value));

    const enteredCount = filteredStudents.filter((student: any) => markValues[student.id] !== undefined && markValues[student.id] !== '').length;
    const average = values.length ? (values.reduce((sum: number, value: number) => sum + value, 0) / values.length).toFixed(1) : '0.0';

    return {
      enteredCount,
      remainingCount: Math.max(filteredStudents.length - enteredCount, 0),
      average,
    };
  }, [filteredStudents, markValues]);

  const create = async () => {
    if (!selectedAssignment || !title.trim()) {
      showNotice({
        title: 'Assessment details missing',
        message: 'Choose a class and enter an assessment title before creating it.',
        tone: 'error',
      });
      return;
    }

    try {
      await createAssessment.mutateAsync({
        sectionId: selectedAssignment.sectionId,
        subjectId: selectedAssignment.subjectId,
        title,
        type: assessmentType,
        maxMarks: Number(maxMarks),
      });
      showNotice({
        title: 'Assessment created',
        message: 'Marks entry is now ready for this evaluation.',
        tone: 'success',
      });
      setTitle('');
    } catch {
      showNotice({
        title: 'Create failed',
        message: 'We could not create the assessment right now.',
        tone: 'error',
      });
    }
  };

  const submit = async () => {
    if (!selectedAssessment || !filteredStudents.length) {
      showNotice({
        title: 'Marks not ready',
        message: 'Create or select an assessment before saving marks.',
        tone: 'error',
      });
      return;
    }

    try {
      await submitMarks.mutateAsync({
        assessmentId: selectedAssessment.id,
        records: filteredStudents.map((student: any) => ({
          studentId: student.id,
          marksObtained: Number(markValues[student.id] ?? 0),
        })),
      });
      showNotice({
        title: 'Marks saved',
        message: 'Student marks were updated successfully.',
        tone: 'success',
      });
    } catch {
      showNotice({
        title: 'Save failed',
        message: 'We could not save marks right now.',
        tone: 'error',
      });
    }
  };

  return (
    <Screen>
      <HeroBanner
        eyebrow="Marks"
        title="Enter internal scores in a cleaner, more teacher-friendly workspace."
        description="Create the assessment, review the active class context, and capture marks with clearer score limits, search, and remark handling."
        aside={<StatusPill label={selectedAssessment ? 'ACTIVE' : 'PENDING'} />}
      />

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <InfoBadge label="Section" value={selectedAssignment ? `${selectedAssignment.className} ${selectedAssignment.sectionName}` : '--'} />
        </View>
        <View style={{ flex: 1 }}>
          <InfoBadge label="Subject" value={selectedAssignment?.subjectName ?? '--'} />
        </View>
      </View>

      <SectionBlock title="Assessment setup" subtitle="Create a marks component with strong context before you begin entry.">
        <SegmentedButtons
          value={selectedAssignment?.id ?? ''}
          onValueChange={setSelectedAssignmentId}
          buttons={assignments.slice(0, 4).map((assignment: any) => ({
            value: assignment.id,
            label: `${assignment.sectionName} - ${assignment.subjectName}`,
          }))}
        />

        <View style={{ marginTop: 16 }}>
          <FormSection title="Evaluation details" description="Keep labels readable and limits explicit so teachers can enter scores with less confusion.">
            <TextInput
              label="Assessment title"
              value={title}
              onChangeText={setTitle}
              mode="outlined"
              style={inputStyle}
            />
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
              <TextInput
                label="Maximum marks"
                value={maxMarks}
                onChangeText={setMaxMarks}
                keyboardType="numeric"
                mode="outlined"
                style={[{ flex: 1 }, inputStyle]}
              />
              <TextInput
                label="Current subject"
                value={selectedAssignment?.subjectName ?? ''}
                editable={false}
                mode="outlined"
                style={[{ flex: 1 }, inputStyle]}
              />
            </View>
            <SegmentedButtons
              value={assessmentType}
              onValueChange={(value) => setAssessmentType(value as AssessmentType)}
              style={{ marginTop: 12 }}
              buttons={[
                { value: 'QUIZ', label: 'Quiz' },
                { value: 'ASSIGNMENT', label: 'Assignment' },
                { value: 'MID_EXAM', label: 'Mid' },
                { value: 'FINAL_EXAM', label: 'Final' },
              ]}
            />
            <ActionButton
              label="Create Assessment"
              icon="plus-circle-outline"
              variant="primary"
              fullWidth
              style={{ marginTop: 14 }}
              onPress={() => void create()}
              loading={createAssessment.isPending}
              disabled={createAssessment.isPending}
            />
          </FormSection>
        </View>
      </SectionBlock>

      <SectionBlock
        title="Active evaluation"
        subtitle="The current marks lane stays visible while you enter student scores."
        action={<StatusPill label={selectedAssessment?.type ?? 'Not Ready'} />}
      >
        <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
          <InlineMetric label="Assessment" value={selectedAssessment?.title ?? 'Create one'} />
          <InlineMetric label="Out of" value={selectedAssessment ? String(selectedAssessment.maxMarks) : maxMarks} tone="positive" />
          <InlineMetric label="Recent items" value={String(performance.data?.recentAssessments?.length ?? 0)} />
        </View>
        <Text variant="bodyMedium" style={{ color: '#90a9c2', marginTop: 14 }}>
          {selectedAssessment
            ? `${selectedAssessment.title} is ready for score entry in ${selectedAssignment?.subjectName ?? 'the selected subject'}.`
            : 'Create an assessment above to unlock score entry and validation context.'}
        </Text>
      </SectionBlock>

      <SectionBlock title="Entry summary" subtitle="Track how much of the current roster has been filled before saving.">
        <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
          <InlineMetric label="Entered" value={String(marksSummary.enteredCount)} tone="positive" />
          <InlineMetric label="Remaining" value={String(marksSummary.remainingCount)} tone="warning" />
          <InlineMetric label="Average" value={marksSummary.average} />
        </View>
      </SectionBlock>

      <Searchbar
        placeholder="Search students by name, roll number, or USN"
        value={search}
        onChangeText={setSearch}
        style={{ marginBottom: 16, backgroundColor: 'rgba(10, 20, 33, 0.92)' }}
        inputStyle={{ color: '#f7fbff' }}
      />

      {filteredStudents.length ? (
        filteredStudents.map((student: any, index: number) => {
          const numericMark = Number(markValues[student.id] ?? 0);
          const max = Number(selectedAssessment?.maxMarks ?? maxMarks ?? 0);
          const isHigh = max > 0 && numericMark / max >= 0.75;

          return (
            <GlassCard key={student.id} style={{ marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text variant="labelMedium" style={{ color: '#7f98b3' }}>Student {index + 1}</Text>
                  <Text variant="titleMedium" style={{ color: '#f7fbff', marginTop: 4, fontWeight: '700' }}>
                    {student.firstName} {student.lastName}
                  </Text>
                  <Text variant="bodySmall" style={{ color: '#90a9c2', marginTop: 6 }}>
                    USN {student.usn ?? '--'} | Roll {student.rollNumber ?? '--'}
                  </Text>
                </View>
                <StatusPill label={isHigh ? 'READY' : 'Review'} />
              </View>

              <View style={{ flexDirection: 'row', gap: 12, marginTop: 14 }}>
                <TextInput
                  label="Marks obtained"
                  value={markValues[student.id] ?? ''}
                  onChangeText={(value) => setMarkValues((current) => ({ ...current, [student.id]: value }))}
                  keyboardType="numeric"
                  mode="outlined"
                  style={[{ flex: 1 }, inputStyle]}
                />
                <GlassCard style={{ flex: 1, padding: 14, borderRadius: 22, backgroundColor: 'rgba(7, 17, 29, 0.62)' }}>
                  <Text variant="labelMedium" style={{ color: '#8aa6c1' }}>Score limit</Text>
                  <Text variant="titleMedium" style={{ color: '#f7fbff', marginTop: 6, fontWeight: '700' }}>
                    Out of {selectedAssessment?.maxMarks ?? maxMarks}
                  </Text>
                </GlassCard>
              </View>

              <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
                <ActionButton
                  label={remarkStudentId === student.id ? 'Close Remark' : 'Add Remark'}
                  icon="comment-text-outline"
                  variant={remarkStudentId === student.id ? 'primary' : 'secondary'}
                  size="small"
                  onPress={() => setRemarkStudentId((current) => (current === student.id ? '' : student.id))}
                />
              </View>

              {remarkStudentId === student.id ? (
                <View style={{ marginTop: 14 }}>
                  <TextInput
                    label="Teacher remark"
                    value={remarkText}
                    onChangeText={setRemarkText}
                    mode="outlined"
                    multiline
                    style={inputStyle}
                  />
                  <ActionButton
                    label="Save Remark"
                    icon="content-save-outline"
                    variant="ghost"
                    style={{ marginTop: 12 }}
                    onPress={() => {
                      if (!remarkText.trim()) {
                        return;
                      }

                      void createRemark
                        .mutateAsync({ studentId: student.id, content: remarkText })
                        .then(() => {
                          showNotice({
                            title: 'Remark saved',
                            message: 'The student remark was added successfully.',
                            tone: 'success',
                          });
                          setRemarkText('');
                          setRemarkStudentId('');
                        })
                        .catch(() => {
                          showNotice({
                            title: 'Remark failed',
                            message: 'We could not save the remark right now.',
                            tone: 'error',
                          });
                        });
                    }}
                    loading={createRemark.isPending}
                    disabled={createRemark.isPending}
                  />
                </View>
              ) : null}
            </GlassCard>
          );
        })
      ) : (
        <EmptyState title="No students match the current search" description="Clear the search or try a different student keyword to continue entering marks." />
      )}

      <GlassCard>
        <Text variant="titleMedium" style={{ color: '#f7fbff', fontWeight: '700' }}>
          Save marks for this assessment
        </Text>
        <Text variant="bodyMedium" style={{ color: '#90a9c2', marginTop: 6 }}>
          Scores are saved for the visible student list, so search and filter first if you want to work in smaller batches.
        </Text>
        <ActionButton
          label="Save Marks"
          icon="content-save-outline"
          variant="primary"
          fullWidth
          style={{ marginTop: 16 }}
          onPress={() => void submit()}
          loading={submitMarks.isPending}
          disabled={submitMarks.isPending}
        />
      </GlassCard>
    </Screen>
  );
}
