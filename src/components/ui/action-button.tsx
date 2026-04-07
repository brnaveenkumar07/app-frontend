import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleProp, TextStyle, View, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';

type ActionButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ActionButtonSize = 'small' | 'medium';

type ActionButtonProps = {
  label: string;
  onPress: () => void;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  variant?: ActionButtonVariant;
  size?: ActionButtonSize;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
};

const variantStyles: Record<
  ActionButtonVariant,
  {
    backgroundColor: string;
    borderColor: string;
    textColor: string;
    iconColor: string;
    pressedBackgroundColor: string;
    shadowColor?: string;
  }
> = {
  primary: {
    backgroundColor: '#7dd3fc',
    borderColor: '#a5e3ff',
    textColor: '#031221',
    iconColor: '#031221',
    pressedBackgroundColor: '#68c4f4',
    shadowColor: 'rgba(125, 211, 252, 0.22)',
  },
  secondary: {
    backgroundColor: 'rgba(15, 28, 44, 0.92)',
    borderColor: 'rgba(103, 136, 170, 0.28)',
    textColor: '#e0edf8',
    iconColor: '#c8dbec',
    pressedBackgroundColor: 'rgba(24, 41, 62, 0.98)',
  },
  danger: {
    backgroundColor: 'rgba(67, 23, 32, 0.94)',
    borderColor: 'rgba(239, 116, 141, 0.45)',
    textColor: '#ffd7df',
    iconColor: '#ffb8c8',
    pressedBackgroundColor: 'rgba(86, 28, 40, 0.98)',
  },
  ghost: {
    backgroundColor: 'rgba(13, 24, 37, 0.52)',
    borderColor: 'rgba(80, 108, 138, 0.22)',
    textColor: '#aec3d8',
    iconColor: '#8fb2d5',
    pressedBackgroundColor: 'rgba(24, 38, 56, 0.8)',
  },
};

const sizeStyles: Record<ActionButtonSize, { minHeight: number; paddingHorizontal: number; labelVariant: 'labelMedium' | 'labelLarge'; iconSize: number }> = {
  small: {
    minHeight: 40,
    paddingHorizontal: 14,
    labelVariant: 'labelMedium',
    iconSize: 16,
  },
  medium: {
    minHeight: 50,
    paddingHorizontal: 18,
    labelVariant: 'labelLarge',
    iconSize: 18,
  },
};

export function ActionButton({
  label,
  onPress,
  icon,
  variant = 'secondary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  fullWidth = false,
}: ActionButtonProps) {
  const palette = variantStyles[variant];
  const metrics = sizeStyles[size];
  const inactive = disabled || loading;

  return (
    <Pressable
      onPress={inactive ? undefined : onPress}
      android_ripple={{ color: 'rgba(255,255,255,0.08)' }}
      style={({ pressed }) => [
        {
          minHeight: metrics.minHeight,
          paddingHorizontal: metrics.paddingHorizontal,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: palette.borderColor,
          backgroundColor: pressed && !inactive ? palette.pressedBackgroundColor : palette.backgroundColor,
          justifyContent: 'center',
          alignItems: 'center',
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          opacity: inactive ? 0.58 : 1,
          shadowColor: palette.shadowColor ?? 'transparent',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: pressed ? 0.08 : 0.18,
          shadowRadius: pressed ? 12 : 18,
          elevation: pressed ? 1 : 3,
          transform: [{ scale: pressed && !inactive ? 0.985 : 1 }, { translateY: pressed && !inactive ? 1 : 0 }],
        },
        style,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        {loading ? <ActivityIndicator size="small" color={palette.textColor} /> : null}
        {!loading && icon ? <MaterialCommunityIcons name={icon} size={metrics.iconSize} color={palette.iconColor} /> : null}
        <Text variant={metrics.labelVariant} style={buttonLabelStyle(palette.textColor)}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

function buttonLabelStyle(color: string): TextStyle {
  return {
    color,
    letterSpacing: 0.2,
    fontWeight: '700',
  };
}
