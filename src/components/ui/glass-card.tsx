import { PropsWithChildren } from 'react';
import { View, ViewStyle } from 'react-native';

type GlassCardProps = PropsWithChildren<{
  style?: ViewStyle;
}>;

export function GlassCard({ children, style }: GlassCardProps) {
  return (
    <View
      style={[
        {
          borderRadius: 30,
          backgroundColor: 'rgba(10, 20, 33, 0.92)',
          borderWidth: 1,
          borderColor: 'rgba(109, 145, 176, 0.18)',
          padding: 20,
          overflow: 'hidden',
          shadowColor: '#020812',
          shadowOffset: { width: 0, height: 18 },
          shadowOpacity: 0.28,
          shadowRadius: 28,
          elevation: 8,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
