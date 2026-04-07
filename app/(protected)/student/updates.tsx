import { View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { Screen } from '../../../src/components/ui/screen';
import { GlassCard } from '../../../src/components/ui/glass-card';
import { SectionTitle } from '../../../src/components/ui/section-title';
import { useAnnouncements } from '../../../src/features/announcements/use-announcements';
import { useMarkNotificationRead, useNotifications } from '../../../src/features/notifications/use-notifications';

export default function StudentUpdatesScreen() {
  const announcements = useAnnouncements();
  const notifications = useNotifications();
  const markRead = useMarkNotificationRead();

  return (
    <Screen>
      <SectionTitle title="Updates and alerts" subtitle="Announcements, reminders, and mark upload notifications." />
      <GlassCard style={{ marginBottom: 16 }}>
        <Text variant="titleMedium" style={{ color: '#f7fbff', marginBottom: 12 }}>
          Notifications
        </Text>
        {notifications.data?.map((notification: any) => (
          <View key={notification.id} style={{ marginBottom: 12 }}>
            <Text variant="titleSmall" style={{ color: '#f7fbff' }}>
              {notification.title}
            </Text>
            <Text variant="bodySmall" style={{ color: '#8ba0bf', marginTop: 4 }}>
              {notification.body}
            </Text>
            {!notification.readAt ? (
              <Button compact mode="text" onPress={() => markRead.mutate(notification.id)} style={{ alignSelf: 'flex-start', marginTop: 4 }}>
                Mark read
              </Button>
            ) : null}
          </View>
        ))}
      </GlassCard>

      {announcements.data?.map((item: any) => (
        <GlassCard key={item.id} style={{ marginBottom: 14 }}>
          <Text variant="titleMedium" style={{ color: '#f7fbff' }}>
            {item.title}
          </Text>
          <Text variant="bodySmall" style={{ color: '#8ba0bf', marginTop: 6 }}>
            {item.content}
          </Text>
        </GlassCard>
      ))}
    </Screen>
  );
}
