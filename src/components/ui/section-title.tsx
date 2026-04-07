import { View } from 'react-native';
import { Text } from 'react-native-paper';

type SectionTitleProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
};

export function SectionTitle({ title, subtitle, eyebrow }: SectionTitleProps) {
  return (
    <View style={{ marginBottom: 18 }}>
      {eyebrow ? (
        <Text variant="labelLarge" style={{ color: '#7dd3fc', letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 6 }}>
          {eyebrow}
        </Text>
      ) : null}
      <Text variant="headlineSmall" style={{ color: '#f3f7fb', fontWeight: '700' }}>
        {title}
      </Text>
      {subtitle ? (
        <Text variant="bodyMedium" style={{ color: '#9db0c4', marginTop: 6, lineHeight: 21 }}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
