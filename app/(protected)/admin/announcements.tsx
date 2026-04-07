import { useState } from 'react';
import { View } from 'react-native';
import { Button, HelperText, SegmentedButtons, Text, TextInput } from 'react-native-paper';
import { Screen } from '../../../src/components/ui/screen';
import { GlassCard } from '../../../src/components/ui/glass-card';
import { SectionTitle } from '../../../src/components/ui/section-title';
import { useAnnouncements, useCreateAnnouncement } from '../../../src/features/announcements/use-announcements';
import { useFeedback } from '../../../src/providers/feedback-provider';

export default function AdminAnnouncementsScreen() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [audience, setAudience] = useState<'SCHOOL' | 'ROLE'>('SCHOOL');
  const announcements = useAnnouncements();
  const createAnnouncement = useCreateAnnouncement();
  const { showNotice } = useFeedback();

  const submit = async () => {
    if (!title.trim() || !content.trim()) {
      showNotice({
        title: 'Incomplete announcement',
        message: 'Add both a title and message before publishing.',
        tone: 'error',
      });
      return;
    }

    try {
      await createAnnouncement.mutateAsync({
        title,
        content,
        audience,
        audienceRole: audience === 'ROLE' ? 'STUDENT' : undefined,
      });
      showNotice({
        title: 'Announcement published',
        message: 'Your update is now visible to the selected audience.',
        tone: 'success',
      });
      setTitle('');
      setContent('');
    } catch {
      showNotice({
        title: 'Publish failed',
        message: 'We could not publish the announcement right now.',
        tone: 'error',
      });
    }
  };

  return (
    <Screen>
      <SectionTitle title="Broadcast center" subtitle="Publish polished institution updates and keep every stakeholder informed." />
      <GlassCard style={{ marginBottom: 16 }}>
        <TextInput
          label="Announcement title"
          value={title}
          onChangeText={setTitle}
          mode="outlined"
          style={{ marginBottom: 12, backgroundColor: 'transparent' }}
        />
        <TextInput
          label="Message"
          value={content}
          onChangeText={setContent}
          multiline
          numberOfLines={4}
          mode="outlined"
          style={{ backgroundColor: 'transparent' }}
        />
        <SegmentedButtons
          value={audience}
          onValueChange={(value) => setAudience(value as 'SCHOOL' | 'ROLE')}
          style={{ marginTop: 14 }}
          buttons={[
            { value: 'SCHOOL', label: 'All school' },
            { value: 'ROLE', label: 'Students' },
          ]}
        />
        <Button mode="contained" onPress={() => void submit()} style={{ marginTop: 14 }} loading={createAnnouncement.isPending}>
          Publish announcement
        </Button>
        <HelperText type="info" visible={false}>
          Announcement published successfully.
        </HelperText>
      </GlassCard>

      {announcements.data?.map((item: any) => (
        <GlassCard key={item.id} style={{ marginBottom: 14 }}>
          <Text variant="titleMedium" style={{ color: '#f7fbff' }}>
            {item.title}
          </Text>
          <Text variant="bodySmall" style={{ color: '#8ba0bf', marginTop: 6 }}>
            {item.content}
          </Text>
          <View style={{ marginTop: 8, flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text variant="labelMedium" style={{ color: '#7dd3fc' }}>
              {item.audience}
            </Text>
            <Text variant="bodySmall" style={{ color: '#6f86a8' }}>
              {item.section?.name ? `Section ${item.section.name}` : 'Global'}
            </Text>
          </View>
        </GlassCard>
      ))}
    </Screen>
  );
}
