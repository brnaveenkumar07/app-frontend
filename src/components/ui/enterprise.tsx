import { PropsWithChildren, ReactNode } from 'react';
import { View } from 'react-native';
import { Divider, Text } from 'react-native-paper';
import { GlassCard } from './glass-card';

export function HeroBanner({
  eyebrow,
  title,
  description,
  aside,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  aside?: ReactNode;
}) {
  return (
    <GlassCard
      style={{
        marginBottom: 18,
        backgroundColor: 'rgba(9, 20, 34, 0.95)',
        borderColor: 'rgba(125, 211, 252, 0.16)',
      }}
    >
      <View style={{ flexDirection: 'row', gap: 16, alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}>
          {eyebrow ? (
            <Text variant="labelLarge" style={{ color: '#7dd3fc', textTransform: 'uppercase', letterSpacing: 0.7 }}>
              {eyebrow}
            </Text>
          ) : null}
          <Text variant="headlineSmall" style={{ color: '#f7fbff', marginTop: 8, fontWeight: '700' }}>
            {title}
          </Text>
          <Text variant="bodyMedium" style={{ color: '#9db0c4', marginTop: 8, lineHeight: 21 }}>
            {description}
          </Text>
        </View>
        {aside ? <View style={{ alignItems: 'flex-end' }}>{aside}</View> : null}
      </View>
    </GlassCard>
  );
}

export function SectionBlock({
  title,
  subtitle,
  action,
  children,
}: PropsWithChildren<{
  title: string;
  subtitle?: string;
  action?: ReactNode;
}>) {
  return (
    <GlassCard style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text variant="titleMedium" style={{ color: '#f7fbff', fontWeight: '700' }}>
            {title}
          </Text>
          {subtitle ? (
            <Text variant="bodyMedium" style={{ color: '#8fa8c2', marginTop: 6, lineHeight: 20 }}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {action}
      </View>
      <View style={{ marginTop: 16 }}>{children}</View>
    </GlassCard>
  );
}

export function FormSection({
  title,
  description,
  children,
}: PropsWithChildren<{
  title: string;
  description?: string;
}>) {
  return (
    <View
      style={{
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(109, 145, 176, 0.14)',
        backgroundColor: 'rgba(7, 17, 29, 0.52)',
        padding: 16,
        marginBottom: 14,
      }}
    >
      <Text variant="titleSmall" style={{ color: '#edf4fb', fontWeight: '700' }}>
        {title}
      </Text>
      {description ? (
        <Text variant="bodySmall" style={{ color: '#8fa8c2', marginTop: 4, lineHeight: 18 }}>
          {description}
        </Text>
      ) : null}
      <View style={{ marginTop: 14 }}>{children}</View>
    </View>
  );
}

export function InfoBadge({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        borderRadius: 18,
        borderWidth: 1,
        borderColor: 'rgba(109, 145, 176, 0.14)',
        backgroundColor: 'rgba(7, 17, 29, 0.58)',
        paddingHorizontal: 12,
        paddingVertical: 10,
        minWidth: 88,
      }}
    >
      <Text variant="labelMedium" style={{ color: '#7f98b3' }}>
        {label}
      </Text>
      <Text variant="titleMedium" style={{ color: '#f7fbff', marginTop: 4, fontWeight: '700' }}>
        {value}
      </Text>
    </View>
  );
}

export function InlineMetric({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string;
  tone?: 'default' | 'positive' | 'warning';
}) {
  const colors = {
    default: { backgroundColor: 'rgba(125, 211, 252, 0.08)', color: '#dce8f3' },
    positive: { backgroundColor: 'rgba(52, 211, 153, 0.1)', color: '#b7f7dc' },
    warning: { backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#fdd9a1' },
  }[tone];

  return (
    <View
      style={{
        borderRadius: 18,
        backgroundColor: colors.backgroundColor,
        paddingHorizontal: 12,
        paddingVertical: 10,
      }}
    >
      <Text variant="labelMedium" style={{ color: '#88a1ba' }}>
        {label}
      </Text>
      <Text variant="titleMedium" style={{ color: colors.color, marginTop: 3, fontWeight: '700' }}>
        {value}
      </Text>
    </View>
  );
}

export function DataPoint({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ marginBottom: 8 }}>
      <Text variant="labelMedium" style={{ color: '#7890aa' }}>
        {label}
      </Text>
      <Text variant="bodyLarge" style={{ color: '#e8f0f8', marginTop: 2 }}>
        {value}
      </Text>
    </View>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <View
      style={{
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(109, 145, 176, 0.14)',
        backgroundColor: 'rgba(7, 17, 29, 0.52)',
        padding: 20,
        alignItems: 'flex-start',
      }}
    >
      <Text variant="titleSmall" style={{ color: '#f4f8fc', fontWeight: '700' }}>
        {title}
      </Text>
      <Text variant="bodyMedium" style={{ color: '#8fa8c2', marginTop: 6, lineHeight: 20 }}>
        {description}
      </Text>
    </View>
  );
}

export function CardDivider() {
  return <Divider style={{ backgroundColor: 'rgba(109, 145, 176, 0.12)', marginVertical: 14 }} />;
}
