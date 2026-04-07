import { useMemo, useState } from 'react';
import { Button, SegmentedButtons, Text, TextInput } from 'react-native-paper';
import { Screen } from '../../../src/components/ui/screen';
import { GlassCard } from '../../../src/components/ui/glass-card';
import { SectionTitle } from '../../../src/components/ui/section-title';
import { useAnnouncements, useCreateAnnouncement } from '../../../src/features/announcements/use-announcements';
import { useTeacherAttendanceWorkspace } from '../../../src/features/attendance/use-teacher-attendance';
import { useFeedback } from '../../../src/providers/feedback-provider';

export default function TeacherAnnouncementsScreen() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [messageType, setMessageType] = useState<'Homework' | 'Announcement'>('Homework');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | undefined>();
  const workspace = useTeacherAttendanceWorkspace();
  const announcements = useAnnouncements();
  const createAnnouncement = useCreateAnnouncement();
  const { showNotice } = useFeedback();

  const selectedAssignment = useMemo(
    () => workspace.data?.assignments?.find((assignment: any) => assignment.id === selectedAssignmentId) ?? workspace.data?.assignments?.[0],
    [selectedAssignmentId, workspace.data?.assignments],
  );

  const submit = async () => {
    if (!selectedAssignment || !title.trim() || !content.trim()) {
      showNotice({
        title: 'Incomplete update',
        message: 'Choose a class, then add a title and message before publishing.',
        tone: 'error',
      });
      return;
    }

    try {
      await createAnnouncement.mutateAsync({
        title: messageType === 'Homework' && !title.toLowerCase().includes('homework') ? `Homework: ${title}` : title,
        content,
        audience: 'SECTION',
        sectionId: selectedAssignment.sectionId,
      });
      showNotice({
        title: 'Section update published',
        message: 'Your class has received the latest update.',
        tone: 'success',
      });
      setTitle('');
      setContent('');
    } catch {
      showNotice({
        title: 'Publish failed',
        message: 'We could not publish this class update right now.',
        tone: 'error',
      });
    }
  };

  return (
    <Screen>
      <SectionTitle title="Class updates" subtitle="Send homework, announcements, and reminders to the right section with a cleaner publishing flow." />
      <GlassCard style={{ marginBottom: 16 }}>
        <SegmentedButtons
          value={selectedAssignment?.id ?? ''}
          onValueChange={setSelectedAssignmentId}
          buttons={(workspace.data?.assignments ?? []).slice(0, 3).map((assignment: any) => ({
            value: assignment.id,
            label: `${assignment.sectionName} - ${assignment.subjectName}`,
          }))}
        />
        <SegmentedButtons
          value={messageType}
          onValueChange={(value) => setMessageType(value as 'Homework' | 'Announcement')}
          style={{ marginTop: 14 }}
          buttons={[
            { value: 'Homework', label: 'Homework' },
            { value: 'Announcement', label: 'Announcement' },
          ]}
        />
        <TextInput
          label="Title"
          value={title}
          onChangeText={setTitle}
          mode="outlined"
          style={{ marginTop: 14, backgroundColor: 'transparent' }}
        />
        <TextInput
          label="Message"
          value={content}
          onChangeText={setContent}
          multiline
          numberOfLines={4}
          mode="outlined"
          style={{ marginTop: 12, backgroundColor: 'transparent' }}
        />
        <Button mode="contained" style={{ marginTop: 14 }} onPress={() => void submit()} loading={createAnnouncement.isPending}>
          Publish to section
        </Button>
      </GlassCard>

      {announcements.data?.map((item: any) => (
        <GlassCard key={item.id} style={{ marginBottom: 14 }}>
          <Text variant="titleMedium" style={{ color: '#f7fbff' }}>
            {item.title}
          </Text>
          <Text variant="bodySmall" style={{ color: '#8ba0bf', marginTop: 6 }}>
            {item.content}
          </Text>
          <Text variant="labelSmall" style={{ color: '#7dd3fc', marginTop: 8 }}>
            {item.title.toLowerCase().includes('homework') ? 'Homework' : 'Class update'}
          </Text>
        </GlassCard>
      ))}
    </Screen>
  );
}
