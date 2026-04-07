import { z } from 'zod';

export const resetPasswordSchema = z
  .object({
    email: z.string().email('Enter a valid institutional email'),
    schoolCode: z.string().min(2, 'Enter your school code'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
