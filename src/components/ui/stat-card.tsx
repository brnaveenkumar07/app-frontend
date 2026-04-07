import { ReactNode } from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

type StatCardProps = {
  label: string;
  value: string;
  caption?: string;
  icon?: ReactNode;
};

export function StatCard({ label, value, caption, icon }: StatCardProps) {
  return (
    <View
      style={{
        marginBottom: 16,
        borderRadius: 28,
        backgroundColor: 'rgba(10, 20, 33, 0.9)',
        borderWidth: 1,
        borderColor: 'rgba(109, 145, 176, 0.18)',
        padding: 18,
      }}
    >
      <View style={{ marginBottom: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text variant="labelLarge" style={{ color: '#8fb1cf' }}>
          {label}
        </Text>
        {icon}
      </View>
      <Text variant="headlineMedium" style={{ color: '#f3f7fb', fontWeight: '700' }}>
        {value}
      </Text>
      {caption ? (
        <Text variant="bodyMedium" style={{ color: '#9db0c4', marginTop: 8, lineHeight: 20 }}>
          {caption}
        </Text>
      ) : null}
    </View>
  );
}
