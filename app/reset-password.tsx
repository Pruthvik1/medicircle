import { Feather } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MedicircleLogo } from '@/components/brand/medicircle-logo';
import { FormErrorBanner } from '@/components/forms/form-error-banner';
import { RequiredLabel } from '@/components/forms/required-label';
import { Box } from '@/components/ui/box';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { FormControl, FormControlError, FormControlErrorText } from '@/components/ui/form-control';
import { Input, InputField, InputSlot } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { applyRecoverySession, useResetPasswordMutation } from '@/features/auth/api';
import {
  passwordRules,
  resetPasswordRequestSchema,
  type ResetPasswordRequest,
} from '@/lib/schemas/auth';

function SecurityRequirementList({ password }: { password: string }) {
  return (
    <Box className="w-full rounded-xl border border-border bg-secondary/40 p-4">
      <Text className="mb-3 text-sm font-semibold text-secondary-foreground">
        Security Requirement
      </Text>
      {passwordRules.map((rule) => {
        const met = rule.test(password);
        return (
          <View
            key={rule.key}
            style={{
              marginBottom: 8,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Feather name="check" size={14} color={met ? 'rgb(23 178 106)' : 'rgb(208 213 221)'} />
            <Text
              className={
                met ? 'text-xs text-secondary-foreground' : 'text-xs text-muted-foreground'
              }
            >
              {rule.label}
            </Text>
          </View>
        );
      })}
    </Box>
  );
}

export default function ResetPasswordScreen() {
  const router = useRouter();
  const url = Linking.useURL();
  const resetPasswordMutation = useResetPasswordMutation();

  // The emailed link carries a recovery session; attach it before updating.
  useEffect(() => {
    if (url) void applyRecoverySession(url);
  }, [url]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ResetPasswordRequest>({
    resolver: zodResolver(resetPasswordRequestSchema),
    mode: 'onChange',
    defaultValues: { password: '', confirmPassword: '' },
  });

  const password = useWatch({ control, name: 'password' }) ?? '';

  const onSubmit = handleSubmit((values) => {
    resetPasswordMutation.mutate(values, {
      onSuccess: () => router.replace('/login'),
    });
  });

  const isSubmitDisabled = !isValid || resetPasswordMutation.isPending;

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
          <View style={{ marginBottom: 20 }}>
            <MedicircleLogo size="sm" />
          </View>

          <View style={{ marginBottom: 20 }}>
            <Text className="mb-2 text-xl font-semibold text-foreground">Set New Password</Text>
            <Text className="text-sm text-muted-foreground">
              Create a new secure password to safely regain access to the admin portal.
            </Text>
          </View>

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormControl isInvalid={!!errors.password} style={{ marginBottom: 16 }}>
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
                <FormControlError className="justify-end">
                  <FormControlErrorText className="text-right">
                    {errors.password?.message}
                  </FormControlErrorText>
                </FormControlError>
              </FormControl>
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormControl isInvalid={!!errors.confirmPassword} style={{ marginBottom: 20 }}>
                <View style={{ marginBottom: 6 }}>
                  <RequiredLabel text="Confirm Password" />
                </View>
                <Input className="rounded-xl border-border">
                  <InputField
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry={!showConfirmPassword}
                    placeholder="Password"
                    placeholderTextColor="rgb(102 112 133)"
                    className="text-base text-foreground"
                  />
                  <InputSlot
                    onPress={() => setShowConfirmPassword((prev) => !prev)}
                    accessibilityLabel={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    <Feather
                      name={showConfirmPassword ? 'eye' : 'eye-off'}
                      size={16}
                      color="rgb(102 112 133)"
                    />
                  </InputSlot>
                </Input>
                <FormControlError className="justify-end">
                  <FormControlErrorText className="text-right">
                    {errors.confirmPassword?.message}
                  </FormControlErrorText>
                </FormControlError>
              </FormControl>
            )}
          />

          <View style={{ marginBottom: 20 }}>
            <SecurityRequirementList password={password} />
          </View>

          {resetPasswordMutation.isError ? (
            <View style={{ marginBottom: 20 }}>
              <FormErrorBanner message="Couldn't reset your password. The link may have expired — request a new one." />
            </View>
          ) : null}

          <Button
            onPress={onSubmit}
            isDisabled={isSubmitDisabled}
            className={
              isSubmitDisabled
                ? 'mb-3 w-full rounded-xl border border-disabled-outline bg-muted data-[disabled=true]:opacity-100'
                : 'mb-3 w-full rounded-xl'
            }
          >
            {resetPasswordMutation.isPending ? <ButtonSpinner /> : null}
            <ButtonText className={isSubmitDisabled ? 'text-disabled-foreground' : undefined}>
              Reset Password
            </ButtonText>
          </Button>

          <Pressable
            onPress={() => router.replace('/login')}
            hitSlop={8}
            className="items-center py-2"
          >
            <Text className="text-sm font-medium text-link">Back to Log In</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
