import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, Redirect } from 'expo-router';
import { View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { GlassCard } from '../src/components/ui/glass-card';
import { Screen } from '../src/components/ui/screen';
import { SectionTitle } from '../src/components/ui/section-title';
import { useAuthStore } from '../src/store/auth-store';

const featureColumns = [
  {
    title: 'Attendance Control',
    icon: 'clipboard-check-outline' as const,
    body: 'Daily attendance capture with section-level visibility, exception tracking, and dependable reporting.',
  },
  {
    title: 'Performance Tracking',
    icon: 'chart-line' as const,
    body: 'Assessment workflows, marks publishing, progress monitoring, and structured academic summaries.',
  },
  {
    title: 'Role-Based Operations',
    icon: 'office-building-cog-outline' as const,
    body: 'Focused workspaces for administrators, teachers, and students with only the actions relevant to each role.',
  },
];

export default function LandingScreen() {
  const { hydrated, session } = useAuthStore();

  if (!hydrated) {
    return null;
  }

  if (session?.user.role === 'ADMIN') {
    return <Redirect href="/(protected)/admin/dashboard" />;
  }

  if (session?.user.role === 'TEACHER') {
    return <Redirect href="/(protected)/teacher/dashboard" />;
  }

  if (session?.user.role === 'STUDENT') {
    return <Redirect href="/(protected)/student/dashboard" />;
  }

  return (
    <Screen>
      <GlassCard style={{ marginBottom: 18, paddingTop: 28, paddingBottom: 28 }}>
        <Text variant="labelLarge" style={{ color: '#93c5fd', letterSpacing: 0.6 }}>
          Professional Academic Operations
        </Text>
        <Text variant="displaySmall" style={{ color: '#f3f7fb', marginTop: 14 }}>
          A cleaner way to manage attendance, performance, and institutional workflows.
        </Text>
        <Text variant="bodyLarge" style={{ color: '#9db0c5', marginTop: 14, lineHeight: 24 }}>
          CampusFlow brings together core school operations in one disciplined mobile experience designed for
          administrators, faculty, and students.
        </Text>
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 22 }}>
          <Link href="/(public)/login" asChild>
            <Button mode="contained">Sign in</Button>
          </Link>
          <Link href="/(public)/signup" asChild>
            <Button mode="contained-tonal">Create student account</Button>
          </Link>
        </View>
      </GlassCard>

      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 18 }}>
        <View style={{ flex: 1 }}>
          <GlassCard>
            <Text variant="labelLarge" style={{ color: '#94a8bf' }}>
              Deployment ready
            </Text>
            <Text variant="headlineSmall" style={{ color: '#f3f7fb', marginTop: 8 }}>
              Secure access
            </Text>
            <Text variant="bodySmall" style={{ color: '#94a8bf', marginTop: 6 }}>
              JWT-based authentication with role-aware routing and persistent sessions.
            </Text>
          </GlassCard>
        </View>
        <View style={{ flex: 1 }}>
          <GlassCard>
            <Text variant="labelLarge" style={{ color: '#94a8bf' }}>
              Built for institutions
            </Text>
            <Text variant="headlineSmall" style={{ color: '#f3f7fb', marginTop: 8 }}>
              Structured oversight
            </Text>
            <Text variant="bodySmall" style={{ color: '#94a8bf', marginTop: 6 }}>
              Dashboards, announcements, directories, and academic records in one controlled flow.
            </Text>
          </GlassCard>
        </View>
      </View>

      <SectionTitle
        title="Core capabilities"
        subtitle="Only the essentials needed to present the platform with a polished, professional first impression."
      />
      {featureColumns.map((feature) => (
        <GlassCard key={feature.title} style={{ marginBottom: 14 }}>
          <MaterialCommunityIcons name={feature.icon} size={24} color="#93c5fd" />
          <Text variant="titleLarge" style={{ color: '#f3f7fb', marginTop: 12 }}>
            {feature.title}
          </Text>
          <Text variant="bodyMedium" style={{ color: '#94a8bf', marginTop: 8 }}>
            {feature.body}
          </Text>
        </GlassCard>
      ))}
    </Screen>
  );
}
