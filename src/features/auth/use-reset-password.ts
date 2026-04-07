import { useRouter } from 'expo-router';
import axios from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { api } from '../../lib/api';
import { useFeedback } from '../../providers/feedback-provider';
import { ResetPasswordFormData, resetPasswordSchema } from './reset-password-schema';

export function useResetPassword() {
  const router = useRouter();
  const { showNotice } = useFeedback();

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: '',
      schoolCode: 'SVIT',
      password: '',
      confirmPassword: '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (payload: ResetPasswordFormData) => {
      const { data } = await api.post<{ message: string }>('/auth/reset-password', {
        email: payload.email.trim().toLowerCase(),
        schoolCode: payload.schoolCode.trim().toUpperCase(),
        password: payload.password,
      });
      return data;
    },
    onSuccess: () => {
      showNotice({
        title: 'Password updated',
        message: 'Sign in with your new password.',
        tone: 'success',
      });
      router.replace('/(public)/login');
    },
    onError: () => {
      showNotice({
        title: 'Reset failed',
        message: 'We could not reset the password right now.',
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

    return 'Unable to reset the password right now. Please try again.';
  })();

  return {
    form,
    mutation,
    errorMessage,
  };
}
