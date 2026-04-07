import { useRouter } from 'expo-router';
import axios from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { api } from '../../lib/api';
import { useFeedback } from '../../providers/feedback-provider';
import { useAuthStore } from '../../store/auth-store';
import { AuthSession } from '../../types/auth';
import { SignupFormData, signupSchema } from './signup-schema';

export function useSignup() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const { showNotice } = useFeedback();

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      schoolCode: 'SVIT',
      password: '',
      confirmPassword: '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (payload: SignupFormData) => {
      const { data } = await api.post<AuthSession>('/auth/register', {
        firstName: payload.firstName.trim(),
        lastName: payload.lastName.trim(),
        email: payload.email.trim().toLowerCase(),
        schoolCode: payload.schoolCode.trim().toUpperCase(),
        password: payload.password,
      });
      return data;
    },
    onSuccess: (session) => {
      void setSession(session);
      showNotice({
        title: 'Account created',
        message: 'Your student account is active and ready to use.',
        tone: 'success',
      });
      router.replace('/');
    },
    onError: () => {
      showNotice({
        title: 'Sign-up failed',
        message: 'We could not create the account right now.',
        tone: 'error',
      });
    },
  });

  const errorMessage = (() => {
    if (!mutation.error) {
      return null;
    }

    if (axios.isAxiosError(mutation.error)) {
      const responseMessage =
        typeof mutation.error.response?.data === 'object' &&
        mutation.error.response?.data &&
        'message' in mutation.error.response.data
          ? mutation.error.response.data.message
          : null;

      if (Array.isArray(responseMessage)) {
        return responseMessage.join(', ');
      }

      if (typeof responseMessage === 'string') {
        return responseMessage;
      }
    }

    return 'Unable to create the account right now. Please try again.';
  })();

  return {
    form,
    mutation,
    errorMessage,
  };
}
