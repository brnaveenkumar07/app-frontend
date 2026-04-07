import { useRouter } from 'expo-router';
import axios from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { api, apiConfigError, candidateApiUrls, getActiveApiUrl } from '../../lib/api';
import { useFeedback } from '../../providers/feedback-provider';
import { useAuthStore } from '../../store/auth-store';
import { AuthSession } from '../../types/auth';
import { LoginFormData, loginSchema } from './auth-schema';

export function useLogin() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const { showNotice } = useFeedback();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (payload: LoginFormData) => {
      if (apiConfigError) {
        throw new Error(apiConfigError);
      }

      const { data } = await api.post<AuthSession>('/auth/login', {
        email: payload.email.trim().toLowerCase(),
        password: payload.password,
      });
      return data;
    },
    onSuccess: (session) => {
      void setSession(session);
      showNotice({
        title: 'Signed in',
        message: 'Your workspace is ready.',
        tone: 'success',
      });
      router.replace('/');
    },
    onError: () => {
      showNotice({
        title: 'Sign-in failed',
        message: 'Please review your credentials and try again.',
        tone: 'error',
      });
    },
  });

  const errorMessage = (() => {
    if (!mutation.error) {
      return null;
    }

    if (axios.isAxiosError(mutation.error)) {
      if (mutation.error.code === 'ECONNABORTED') {
        return 'Login request timed out. Check whether the API server is running and reachable from the device.';
      }

      if (!mutation.error.response) {
        const fallbackCount = Math.max(candidateApiUrls.length - 1, 0);
        return `Unable to reach the API server at ${getActiveApiUrl()}.${fallbackCount ? ` The app also tried ${fallbackCount} fallback endpoint${fallbackCount > 1 ? 's' : ''}.` : ''}`;
      }

      const responseMessage =
        typeof mutation.error.response.data === 'object' &&
        mutation.error.response.data &&
        'message' in mutation.error.response.data
          ? mutation.error.response.data.message
          : null;

      if (Array.isArray(responseMessage)) {
        return responseMessage.join(', ');
      }

      if (typeof responseMessage === 'string') {
        return responseMessage;
      }

      if (mutation.error.response.status === 401) {
        return 'Invalid email or password.';
      }

      return 'Login failed. Please try again.';
    }

    if (mutation.error instanceof Error) {
      return mutation.error.message;
    }

    return 'Login failed. Please try again.';
  })();

  return {
    form,
    mutation,
    errorMessage,
  };
}
