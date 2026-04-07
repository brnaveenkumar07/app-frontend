import { useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Controller } from 'react-hook-form';
import { Pressable, View } from 'react-native';
import { Button, HelperText, Surface, Text, TextInput } from 'react-native-paper';
import { Screen } from '../../src/components/ui/screen';
import { useSignup } from '../../src/features/auth/use-signup';

const formCardStyle = {
  borderRadius: 28,
  backgroundColor: '#0f1c2b',
  borderWidth: 1,
  borderColor: '#25384d',
  padding: 20,
} as const;

const inputTheme = {
  colors: {
    primary: '#3b82f6',
    outline: '#31465f',
    onSurface: '#e8eef6',
    onSurfaceVariant: '#8fa4bc',
    surface: '#102234',
  },
};

export default function SignupScreen() {
  const { form, mutation, errorMessage } = useSignup();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <Screen>
      <View style={{ marginTop: 24, marginBottom: 24 }}>
        <Text variant="headlineLarge" style={{ color: '#f3f7fb' }}>
          Create account
        </Text>
        <Text variant="bodyLarge" style={{ color: '#9db0c5', marginTop: 8 }}>
          Student self-registration is available for configured schools. Use `SVIT` for the seeded demo environment.
        </Text>
      </View>

      <Surface style={formCardStyle} elevation={0}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Controller
            control={form.control}
            name="firstName"
            render={({ field, fieldState }) => (
              <View style={{ flex: 1, marginBottom: 16 }}>
                <Text variant="labelLarge" style={{ marginBottom: 8, color: '#dce7f3' }}>
                  First name
                </Text>
                <TextInput
                  placeholder="Rahul"
                  value={field.value}
                  onChangeText={field.onChange}
                  mode="outlined"
                  theme={inputTheme}
                  textColor="#e8eef6"
                />
                <HelperText type="error" visible={Boolean(fieldState.error)}>
                  {fieldState.error?.message}
                </HelperText>
              </View>
            )}
          />

          <Controller
            control={form.control}
            name="lastName"
            render={({ field, fieldState }) => (
              <View style={{ flex: 1, marginBottom: 16 }}>
                <Text variant="labelLarge" style={{ marginBottom: 8, color: '#dce7f3' }}>
                  Last name
                </Text>
                <TextInput
                  placeholder="Reddy"
                  value={field.value}
                  onChangeText={field.onChange}
                  mode="outlined"
                  theme={inputTheme}
                  textColor="#e8eef6"
                />
                <HelperText type="error" visible={Boolean(fieldState.error)}>
                  {fieldState.error?.message}
                </HelperText>
              </View>
            )}
          />
        </View>

        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <View style={{ marginBottom: 16 }}>
              <Text variant="labelLarge" style={{ marginBottom: 8, color: '#dce7f3' }}>
                Institutional email
              </Text>
              <TextInput
                placeholder="student@svit.edu"
                value={field.value}
                onChangeText={field.onChange}
                autoCapitalize="none"
                keyboardType="email-address"
                mode="outlined"
                theme={inputTheme}
                textColor="#e8eef6"
              />
              <HelperText type="error" visible={Boolean(fieldState.error)}>
                {fieldState.error?.message}
              </HelperText>
            </View>
          )}
        />

        <Controller
          control={form.control}
          name="schoolCode"
          render={({ field, fieldState }) => (
            <View style={{ marginBottom: 16 }}>
              <Text variant="labelLarge" style={{ marginBottom: 8, color: '#dce7f3' }}>
                School code
              </Text>
              <TextInput
                placeholder="SVIT"
                value={field.value}
                onChangeText={field.onChange}
                autoCapitalize="characters"
                mode="outlined"
                theme={inputTheme}
                textColor="#e8eef6"
              />
              <HelperText type="error" visible={Boolean(fieldState.error)}>
                {fieldState.error?.message}
              </HelperText>
            </View>
          )}
        />

        <Controller
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <View style={{ marginBottom: 16 }}>
              <View style={{ marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text variant="labelLarge" style={{ color: '#dce7f3' }}>
                  Password
                </Text>
                <Pressable
                  onPress={() => setShowPassword((current) => !current)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
                >
                  <MaterialCommunityIcons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color="#93c5fd"
                  />
                  <Text variant="labelMedium" style={{ color: '#93c5fd' }}>
                    {showPassword ? 'Hide' : 'Show'}
                  </Text>
                </Pressable>
              </View>
              <TextInput
                placeholder="Create a strong password"
                value={field.value}
                onChangeText={field.onChange}
                secureTextEntry={!showPassword}
                mode="outlined"
                theme={inputTheme}
                textColor="#e8eef6"
              />
              <HelperText type="error" visible={Boolean(fieldState.error)}>
                {fieldState.error?.message}
              </HelperText>
            </View>
          )}
        />

        <Controller
          control={form.control}
          name="confirmPassword"
          render={({ field, fieldState }) => (
            <View style={{ marginBottom: 20 }}>
              <View style={{ marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text variant="labelLarge" style={{ color: '#dce7f3' }}>
                  Confirm password
                </Text>
                <Pressable
                  onPress={() => setShowConfirmPassword((current) => !current)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
                >
                  <MaterialCommunityIcons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color="#93c5fd"
                  />
                  <Text variant="labelMedium" style={{ color: '#93c5fd' }}>
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </Text>
                </Pressable>
              </View>
              <TextInput
                placeholder="Re-enter your password"
                value={field.value}
                onChangeText={field.onChange}
                secureTextEntry={!showConfirmPassword}
                mode="outlined"
                theme={inputTheme}
                textColor="#e8eef6"
              />
              <HelperText type="error" visible={Boolean(fieldState.error)}>
                {fieldState.error?.message}
              </HelperText>
            </View>
          )}
        />

        <Button
          mode="contained"
          onPress={form.handleSubmit((values) => mutation.mutate(values))}
          disabled={mutation.isPending}
          contentStyle={{ paddingVertical: 8 }}
        >
          {mutation.isPending ? 'Creating account...' : 'Create student account'}
        </Button>

        <HelperText type="error" visible={Boolean(errorMessage)} style={{ marginTop: 8 }}>
          {errorMessage ?? ' '}
        </HelperText>

        <Link href="/(public)/login" asChild>
          <Button mode="text" style={{ marginTop: 8 }}>
            Back to sign in
          </Button>
        </Link>
      </Surface>
    </Screen>
  );
}
