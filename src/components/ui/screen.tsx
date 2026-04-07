import { PropsWithChildren } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ScreenProps = PropsWithChildren<{
  padded?: boolean;
  contentContainerStyle?: object;
}>;

export function Screen({ children, padded = true, contentContainerStyle }: ScreenProps) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#07111d' }} edges={['top']}>
      <View
        style={{
          position: 'absolute',
          top: -150,
          right: -90,
          height: 320,
          width: 320,
          borderRadius: 999,
          backgroundColor: 'rgba(125, 211, 252, 0.12)',
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: 140,
          left: -120,
          height: 260,
          width: 260,
          borderRadius: 999,
          backgroundColor: 'rgba(52, 211, 153, 0.09)',
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: 100,
          right: -130,
          height: 240,
          width: 240,
          borderRadius: 999,
          backgroundColor: 'rgba(245, 158, 11, 0.07)',
        }}
      />
      <ScrollView
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={[
          {
            paddingBottom: 56,
          },
          contentContainerStyle,
        ]}
      >
        <View style={{ paddingTop: 16, paddingHorizontal: padded ? 20 : 0 }}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}
