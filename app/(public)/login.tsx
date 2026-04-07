import { useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Controller } from 'react-hook-form';
import { Pressable, View } from 'react-native';
import { Button, HelperText, Surface, Text, TextInput } from 'react-native-paper';
import { Screen } from '../../src/components/ui/screen';
import { useLogin } from '../../src/features/auth/use-login';
import { apiConfigError, candidateApiUrls, getActiveApiUrl, isSeededDemoApiUrl } from '../../src/lib/api';

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

export default function LoginScreen() {
  const { form, mutation, errorMessage } = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const resolvedApiUrl = getActiveApiUrl();
  const showDemoAccess = isSeededDemoApiUrl(resolvedApiUrl);

  return (
    <Screen>
      <View style={{ marginTop: 40, marginBottom: 28 }}>
        <Text variant="headlineLarge" style={{ color: '#f3f7fb' }}>
          CampusFlow
        </Text>
        <Text variant="bodyLarge" style={{ color: '#9db0c5', marginTop: 8 }}>
          Attendance, performance, and academic operations in one professional mobile workspace.
        </Text>
      </View>

      <Surface style={formCardStyle} elevation={0}>
        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <View style={{ marginBottom: 16 }}>
              <Text variant="labelLarge" style={{ marginBottom: 8, color: '#dce7f3' }}>
                Institution email
              </Text>
              <TextInput
                placeholder="name@svit.edu"
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
          name="password"
          render={({ field, fieldState }) => (
            <View style={{ marginBottom: 8 }}>
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
                placeholder="Enter your password"
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

        <Link href="/(public)/forgot-password" asChild>
          <Button mode="text" compact style={{ alignSelf: 'flex-end', marginBottom: 12 }}>
            Forgot password?
          </Button>
        </Link>

        <Button
          mode="contained"
          onPress={form.handleSubmit((values) => mutation.mutate(values))}
          disabled={mutation.isPending}
          contentStyle={{ paddingVertical: 8 }}
        >
          {mutation.isPending ? 'Signing in...' : 'Sign in'}
        </Button>

        <HelperText type="error" visible={Boolean(errorMessage)} style={{ marginTop: 8 }}>
          {errorMessage ?? ' '}
        </HelperText>
      </Surface>

      <View style={{ marginTop: 18, flexDirection: 'row', gap: 12 }}>
        <Surface
          style={{
            flex: 1,
            borderRadius: 24,
            backgroundColor: '#0f1c2b',
            borderWidth: 1,
            borderColor: '#25384d',
            padding: 16,
          }}
          elevation={0}
        >
          <MaterialCommunityIcons name="account-plus-outline" size={22} color="#93c5fd" />
          <Text variant="titleMedium" style={{ marginTop: 12, color: '#f3f7fb' }}>
            Sign up
          </Text>
          <Text variant="bodySmall" style={{ color: '#9db0c5', marginTop: 6 }}>
            Create a new student account using your school code.
          </Text>
          <Link href="/(public)/signup" asChild>
            <Button mode="text" compact style={{ marginTop: 10, alignSelf: 'flex-start' }}>
              Create account
            </Button>
          </Link>
        </Surface>

        <Surface
          style={{
            flex: 1,
            borderRadius: 24,
            backgroundColor: '#0f1c2b',
            borderWidth: 1,
            borderColor: '#25384d',
            padding: 16,
          }}
          elevation={0}
        >
          <MaterialCommunityIcons name="lock-reset" size={22} color="#93c5fd" />
          <Text variant="titleMedium" style={{ marginTop: 12, color: '#f3f7fb' }}>
            Reset access
          </Text>
          <Text variant="bodySmall" style={{ color: '#9db0c5', marginTop: 6 }}>
            Update your password securely with email and school code.
          </Text>
          <Link href="/(public)/forgot-password" asChild>
            <Button mode="text" compact style={{ marginTop: 10, alignSelf: 'flex-start' }}>
              Reset password
            </Button>
          </Link>
        </Surface>
      </View>

      <Surface
        style={{
          borderRadius: 24,
          backgroundColor: '#0f1c2b',
          borderWidth: 1,
          borderColor: '#25384d',
          padding: 16,
          marginTop: 18,
        }}
        elevation={0}
      >
        <Text variant="titleSmall" style={{ color: '#f3f7fb' }}>
          {showDemoAccess ? 'Demo access' : 'Connection details'}
        </Text>
        {showDemoAccess ? (
          <>
            <Text variant="bodySmall" style={{ color: '#9db0c5', marginTop: 8 }}>
              Accounts: `admin@svit.edu`, `teacher@svit.edu`, `student@svit.edu`
            </Text>
            <Text variant="bodySmall" style={{ color: '#9db0c5', marginTop: 6 }}>
              Password: `Password@123`
            </Text>
            <Text variant="bodySmall" style={{ color: '#8ea3ba', marginTop: 6 }}>
              School code: `SVIT`
            </Text>
          </>
        ) : (
          <Text variant="bodySmall" style={{ color: '#9db0c5', marginTop: 8 }}>
            This app is connected to a non-demo backend. Use credentials that exist on that server. The built-in demo
            accounts only work when the app reaches a seeded local API.
          </Text>
        )}
        <Text variant="bodySmall" style={{ color: '#8ea3ba', marginTop: 6 }}>
          API: {resolvedApiUrl}
        </Text>
        {candidateApiUrls.length > 1 ? (
          <Text variant="bodySmall" style={{ color: '#8ea3ba', marginTop: 6 }}>
            Fallbacks: {candidateApiUrls.slice(1).join(', ')}
          </Text>
        ) : null}
        {apiConfigError ? (
          <Text variant="bodySmall" style={{ color: '#fca5a5', marginTop: 6 }}>
            {apiConfigError}
          </Text>
        ) : null}
      </Surface>
    </Screen>
  );
}
