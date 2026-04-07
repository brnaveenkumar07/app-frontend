import { z } from 'zod';

export const signupSchema = z
  .object({
    firstName: z.string().min(2, 'Enter a valid first name'),
    lastName: z.string().min(1, 'Enter a valid last name'),
    email: z.string().email('Enter a valid institutional email'),
    schoolCode: z.string().min(2, 'Enter your school code'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type SignupFormData = z.infer<typeof signupSchema>;
