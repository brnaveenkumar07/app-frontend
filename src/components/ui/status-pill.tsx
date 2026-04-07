import { View } from 'react-native';
import { Text } from 'react-native-paper';

const COLORS: Record<string, { bg: string; fg: string }> = {
  PRESENT: { bg: 'rgba(34, 197, 94, 0.18)', fg: '#86efac' },
  ABSENT: { bg: 'rgba(239, 68, 68, 0.18)', fg: '#fca5a5' },
  LATE: { bg: 'rgba(245, 158, 11, 0.18)', fg: '#fcd34d' },
  EXCUSED: { bg: 'rgba(59, 130, 246, 0.18)', fg: '#93c5fd' },
  ACTIVE: { bg: 'rgba(125, 211, 252, 0.18)', fg: '#bae6fd' },
  INACTIVE: { bg: 'rgba(148, 163, 184, 0.16)', fg: '#d7e0ea' },
  DEFAULT: { bg: 'rgba(148, 163, 184, 0.18)', fg: '#d4dde7' },
};

export function StatusPill({ label }: { label: string }) {
  const colors = COLORS[label] ?? COLORS.DEFAULT;

  return (
    <View
      style={{
        alignSelf: 'flex-start',
        borderRadius: 999,
        backgroundColor: colors.bg,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        paddingHorizontal: 10,
        paddingVertical: 6,
      }}
    >
      <Text variant="labelMedium" style={{ color: colors.fg }}>
        {label.replace('_', ' ')}
      </Text>
    </View>
  );
}
