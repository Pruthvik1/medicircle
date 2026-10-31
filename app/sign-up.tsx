import { zodResolver } from '@hookform/resolvers/zod';
import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { useController, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MedicircleLogo } from '@/components/brand/medicircle-logo';
import { FormErrorBanner } from '@/components/forms/form-error-banner';
import { TextField } from '@/components/forms/text-field';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/context/auth-context';
import { useSignUpMutation } from '@/features/auth/api';
import { signUpRequestSchema, type SignUpRequest } from '@/lib/schemas/auth';

const ROLES = [
  {
    value: 'patient',
    title: "I'm a patient",
    body: 'Find doctors and book visits',
  },
  {
    value: 'doctor',
    title: "I'm a doctor",
    body: 'Run my clinic and appointments',
  },
] as const;

export default function SignUpScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const signUp = useSignUpMutation();
  const [checkEmail, setCheckEmail] = useState(false);

  const { control, handleSubmit, formState } = useForm<SignUpRequest>({
    resolver: zodResolver(signUpRequestSchema),
    mode: 'onChange',
    defaultValues: { fullName: '', email: '', password: '', role: 'patient' },
  });
  const { field: role } = useController({ control, name: 'role' });

  if (user) return <Redirect href="/" />;

  const onSubmit = handleSubmit((values) =>
    signUp.mutate(values, {
      onSuccess: ({ signedIn }) => setCheckEmail(!signedIn),
    })
  );
  const disabled = !formState.isValid || signUp.isPending;

  if (checkEmail) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <View style={{ flex: 1, justifyContent: 'center', padding: 24, gap: 12 }}>
          <Text className="text-xl font-semibold text-foreground">Check your email</Text>
          <Text className="text-sm text-muted-foreground">
            We sent a confirmation link. Open it, then come back and log in.
          </Text>
          <Button onPress={() => router.replace('/login')} className="mt-4 w-full rounded-xl">
            <ButtonText>Go to log in</ButtonText>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ marginBottom: 24 }}>
            <MedicircleLogo size="sm" />
          </View>
          <View style={{ marginBottom: 24 }}>
            <Text className="mb-2 text-xl font-semibold text-foreground">Create your account</Text>
            <Text className="text-sm text-muted-foreground">
              Book appointments or manage your clinic in one place.
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
            {ROLES.map((r) => {
              const active = role.value === r.value;
              return (
                <Pressable
                  key={r.value}
                  onPress={() => role.onChange(r.value)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  className={
                    active
                      ? 'flex-1 rounded-2xl border-2 border-primary bg-primary-soft p-3'
                      : 'flex-1 rounded-2xl border border-border bg-background p-3'
                  }
                >
                  <Text className="text-sm font-semibold text-foreground">{r.title}</Text>
                  <Text className="mt-1 text-xs text-muted-foreground">{r.body}</Text>
                </Pressable>
              );
            })}
          </View>

          <TextField
            control={control}
            name="fullName"
            label="Full name"
            placeholder="Your name"
            autoCapitalize="words"
          />
          <TextField
            control={control}
            name="email"
            label="Email"
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextField
            control={control}
            name="password"
            label="Password"
            placeholder="At least 8 characters"
            secure
          />

          {signUp.isError ? (
            <View style={{ marginBottom: 16 }}>
              <FormErrorBanner
                message={
                  (signUp.error as Error)?.message || "Couldn't create your account. Try again."
                }
              />
            </View>
          ) : null}

          <Button
            onPress={onSubmit}
            isDisabled={disabled}
            className={
              disabled
                ? 'w-full rounded-xl border border-disabled-outline bg-muted data-[disabled=true]:opacity-100'
                : 'w-full rounded-xl'
            }
          >
            {signUp.isPending ? <ButtonSpinner /> : null}
            <ButtonText className={disabled ? 'text-disabled-foreground' : undefined}>
              Create account
            </ButtonText>
          </Button>

          <Pressable
            onPress={() => router.replace('/login')}
            hitSlop={8}
            style={{ marginTop: 20, alignItems: 'center' }}
          >
            <Text className="text-sm text-muted-foreground">
              Already have an account? <Text className="font-medium text-link">Log in</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
