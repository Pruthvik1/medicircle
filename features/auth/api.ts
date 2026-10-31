import { useMutation } from '@tanstack/react-query';
import * as Linking from 'expo-linking';

import { supabase } from '@/lib/supabase';
import {
  forgotPasswordRequestSchema,
  loginRequestSchema,
  resetPasswordRequestSchema,
  signUpRequestSchema,
  type ForgotPasswordRequest,
  type LoginRequest,
  type ResetPasswordRequest,
  type SignUpRequest,
} from '@/lib/schemas/auth';

// Session state is owned by AuthProvider via supabase.auth.onAuthStateChange,
// so these mutations only need to throw on failure.

async function login(payload: LoginRequest) {
  const { email, password } = loginRequestSchema.parse(payload);
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export function useLoginMutation() {
  return useMutation({ mutationFn: login });
}

// Returns true when a session was created straight away. If the project has
// "Confirm email" on, there is no session until the user clicks the email link.
async function signUp(payload: SignUpRequest) {
  const { fullName, email, password, role } = signUpRequestSchema.parse(payload);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role },
      // Without this the confirmation link falls back to the project's Site URL
      // (localhost:3000 by default). Must be in Supabase → Redirect URLs.
      emailRedirectTo: Linking.createURL('/login'),
    },
  });
  if (error) throw error;
  return { signedIn: !!data.session };
}

export function useSignUpMutation() {
  return useMutation({ mutationFn: signUp });
}

async function forgotPassword(payload: ForgotPasswordRequest) {
  const { email } = forgotPasswordRequestSchema.parse(payload);
  // The emailed link opens this deep link with a recovery session attached.
  // Add the URL to Supabase → Authentication → URL Configuration → Redirect URLs.
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: Linking.createURL('/reset-password'),
  });
  if (error) throw error;
}

export function useForgotPasswordMutation() {
  return useMutation({ mutationFn: forgotPassword });
}

async function resetPassword(payload: ResetPasswordRequest) {
  const { password } = resetPasswordRequestSchema.parse(payload);
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
  // Make them sign in with the new password, like the rest of the flow expects.
  await supabase.auth.signOut();
}

export function useResetPasswordMutation() {
  return useMutation({ mutationFn: resetPassword });
}

// Recovery links carry the session in the URL (fragment or query). Call this
// with the incoming URL from the reset-password screen before updating.
export async function applyRecoverySession(url: string) {
  const params = new URLSearchParams(url.split('#')[1] ?? url.split('?')[1] ?? '');
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  if (!accessToken || !refreshToken) return false;
  const { error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  return !error;
}
