import { z } from 'zod';

// Error copy matches Figma node 424:26418 ("00. Login / Invalid Email").
export const loginRequestSchema = z.object({
  email: z.string().email('Please enter a valid email.'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
export type LoginRequest = z.infer<typeof loginRequestSchema>;

export type UserRole = 'patient' | 'doctor' | 'staff';

// The signed-in user as the UI sees it: supabase auth user + profiles row.
export const authUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(['patient', 'doctor', 'staff']),
  // Doctors must finish onboarding (clinic + availability) before using the app.
  needsOnboarding: z.boolean(),
});
export type AuthUser = z.infer<typeof authUserSchema>;

// --- Forgot password -------------------------------------------------

export const forgotPasswordRequestSchema = z.object({
  email: z.string().email('Please enter a valid email.'),
});
export type ForgotPasswordRequest = z.infer<typeof forgotPasswordRequestSchema>;

// --- Reset password ----------------------------------------------------

// Mirrors the "Security Requirement" checklist on the Reset Password
// screen (Figma node 424:26465) — `passwordRules` below is the single
// source of truth both this schema and the live checklist UI read from.
export const passwordRules = [
  {
    key: 'length',
    label: 'Minimum 12 characters',
    test: (value: string) => value.length >= 12,
  },
  {
    key: 'case',
    label: 'Include uppercase & lowercase letter',
    test: (value: string) => /[a-z]/.test(value) && /[A-Z]/.test(value),
  },
  {
    key: 'number',
    label: 'Include at least one number',
    test: (value: string) => /\d/.test(value),
  },
  {
    key: 'special',
    label: 'Include one special character (!@#$%^&*)',
    test: (value: string) => /[!@#$%^&*]/.test(value),
  },
] as const;

const passwordSchema = z
  .string()
  .refine((value) => passwordRules.every((rule) => rule.test(value)), {
    message: 'Password does not meet the security requirements',
  });

export const resetPasswordRequestSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });
export type ResetPasswordRequest = z.infer<typeof resetPasswordRequestSchema>;

// --- Sign up ---------------------------------------------------------

export const signUpRequestSchema = z.object({
  fullName: z.string().trim().min(2, 'Please enter your full name.'),
  email: z.string().email('Please enter a valid email.'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['patient', 'doctor']),
});
export type SignUpRequest = z.infer<typeof signUpRequestSchema>;
