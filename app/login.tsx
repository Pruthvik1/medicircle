import { Feather } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MedicircleLogo } from '@/components/brand/medicircle-logo';
import { FormErrorBanner } from '@/components/forms/form-error-banner';
import { RequiredLabel } from '@/components/forms/required-label';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { FormControl, FormControlError, FormControlErrorText } from '@/components/ui/form-control';
import { Input, InputField, InputSlot } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/context/auth-context';
import { useLoginMutation } from '@/features/auth/api';
import { loginRequestSchema, type LoginRequest } from '@/lib/schemas/auth';

export default function LoginScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const loginMutation = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginRequestSchema),
    mode: 'onChange',
    defaultValues: { email: '', password: '' },
  });

  if (user) {
    return <Redirect href="/" />;
  }

  const onSubmit = handleSubmit((values) => {
    // AuthProvider picks up the new session; the redirect above does the rest.
    loginMutation.mutate(values);
  });

  const isSubmitDisabled = !isValid || loginMutation.isPending;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          {/*
            Explicit `marginBottom` spacing (rather than gap-based VStacks)
            for this screen's vertical stack — the two fields were rendering
            on top of each other because the nested VStack `gap` classes
            weren't being applied on Android, so spacing is set directly
            here instead of relying on that layout path.
          */}
          <View style={{ marginBottom: 24 }}>
            <MedicircleLogo size="sm" />
          </View>

          <View style={{ marginBottom: 24 }}>
            <Text className="mb-2 text-xl font-semibold text-foreground">Welcome back</Text>
            <Text className="text-sm text-muted-foreground">
              Log in to book appointments or manage your clinic.
            </Text>
          </View>

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormControl isInvalid={!!errors.email} style={{ marginBottom: 16 }}>
                <View style={{ marginBottom: 6 }}>
                  <RequiredLabel text="Email" />
                </View>
                <Input className="rounded-xl border-border">
                  <InputField
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    placeholder="Enter your email"
                    placeholderTextColor="rgb(102 112 133)"
                    className="text-base text-foreground"
                  />
                  {errors.email ? (
                    <Feather name="alert-circle" size={16} color="rgb(217 45 32)" />
                  ) : null}
                </Input>
                <FormControlError className="justify-end">
                  <FormControlErrorText className="text-right">
                    {errors.email?.message}
                  </FormControlErrorText>
                </FormControlError>
              </FormControl>
            )}
          />

          <View style={{ marginBottom: 16 }}>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormControl isInvalid={!!errors.password} style={{ marginBottom: 12 }}>
                  <View style={{ marginBottom: 6 }}>
                    <RequiredLabel text="Password" />
                  </View>
                  <Input className="rounded-xl border-border">
                    <InputField
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry={!showPassword}
                      placeholder="Password"
                      placeholderTextColor="rgb(102 112 133)"
                      className="text-base text-foreground"
                    />
                    <InputSlot
                      onPress={() => setShowPassword((prev) => !prev)}
                      accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <Feather
                        name={showPassword ? 'eye' : 'eye-off'}
                        size={16}
                        color="rgb(102 112 133)"
                      />
                    </InputSlot>
                  </Input>
                  <FormControlError>
                    <FormControlErrorText>{errors.password?.message}</FormControlErrorText>
                  </FormControlError>
                </FormControl>
              )}
            />

            <Pressable onPress={() => router.push('/forgot-password')} hitSlop={8}>
              <Text className="text-sm font-medium text-link">Forgot password?</Text>
            </Pressable>
          </View>

          {loginMutation.isError ? (
            <View style={{ marginBottom: 16 }}>
              <FormErrorBanner message="Invalid credentials. Please try again." />
            </View>
          ) : null}

          <Button
            onPress={onSubmit}
            isDisabled={isSubmitDisabled}
            className={
              isSubmitDisabled
                ? 'w-full rounded-xl border border-disabled-outline bg-muted data-[disabled=true]:opacity-100'
                : 'w-full rounded-xl'
            }
          >
            {loginMutation.isPending ? <ButtonSpinner /> : null}
            <ButtonText className={isSubmitDisabled ? 'text-disabled-foreground' : undefined}>
              Log In
            </ButtonText>
          </Button>

          <Pressable
            onPress={() => router.push('/sign-up')}
            hitSlop={8}
            style={{ marginTop: 20, alignItems: 'center' }}
          >
            <Text className="text-sm text-muted-foreground">
              New to medicircle? <Text className="font-medium text-link">Create an account</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
