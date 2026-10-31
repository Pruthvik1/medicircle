import { Feather } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Modal, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MedicircleLogo } from '@/components/brand/medicircle-logo';
import { FormErrorBanner } from '@/components/forms/form-error-banner';
import { RequiredLabel } from '@/components/forms/required-label';
import { Box } from '@/components/ui/box';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { FormControl, FormControlError, FormControlErrorText } from '@/components/ui/form-control';
import { Input, InputField } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useForgotPasswordMutation } from '@/features/auth/api';
import { forgotPasswordRequestSchema, type ForgotPasswordRequest } from '@/lib/schemas/auth';

// "04. Forgot Password / Reset Link Success" (node 424:26493) — a bottom
// sheet presented over this same screen, not a separate route.
function ResetLinkSentSheet({
  visible,
  email,
  onClose,
  onBackToSignIn,
  onResend,
  isResending,
}: {
  visible: boolean;
  email: string;
  onClose: () => void;
  onBackToSignIn: () => void;
  onResend: () => void;
  isResending: boolean;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Box className="flex-1 justify-end bg-black/60">
        <Box className="w-full rounded-t-3xl bg-background p-5">
          <Pressable
            onPress={onClose}
            hitSlop={8}
            className="absolute top-5 right-5 z-10 rounded-xl p-2"
            accessibilityLabel="Close"
          >
            <Feather name="x" size={20} color="rgb(102 112 133)" />
          </Pressable>

          <VStack space="lg" className="items-center pt-2">
            <Box className="size-12 items-center justify-center rounded-full bg-success">
              <Feather name="check" size={24} color="rgb(23 178 106)" />
            </Box>

            <VStack space="xs" className="items-center">
              <Text className="text-lg font-semibold text-foreground">Reset Link Sent</Text>
              <Text className="text-center text-sm text-placeholder">
                Please check the email address{' '}
                <Text className="text-sm font-medium text-secondary-foreground">{email}</Text> for
                instructions to reset your password.
              </Text>
            </VStack>

            <Button onPress={onBackToSignIn} className="w-full rounded-xl">
              <ButtonText>Back to Sign In</ButtonText>
            </Button>

            <Box className="flex-row items-center justify-center gap-1.5">
              <Text className="text-sm text-placeholder">Didn&apos;t receive an email?</Text>
              <Pressable onPress={onResend} disabled={isResending} hitSlop={8}>
                <Text className="text-sm font-medium text-link">
                  {isResending ? 'Resending…' : 'Resend Email'}
                </Text>
              </Pressable>
            </Box>
          </VStack>
        </Box>
      </Box>
    </Modal>
  );
}

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const forgotPasswordMutation = useForgotPasswordMutation();
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors, isValid },
  } = useForm<ForgotPasswordRequest>({
    resolver: zodResolver(forgotPasswordRequestSchema),
    mode: 'onChange',
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit((values) => {
    forgotPasswordMutation.mutate(values, {
      onSuccess: () => setShowSuccess(true),
    });
  });

  const onResend = () => {
    forgotPasswordMutation.mutate({ email: getValues('email') });
  };

  const isSubmitDisabled = !isValid || forgotPasswordMutation.isPending;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top', 'bottom']}>
      <Box className="flex-1 px-4 py-6">
        {/*
          Explicit `marginBottom` spacing rather than gap-based VStacks —
          same fix as the login screen: nested VStack `gap` classes weren't
          being applied on Android, collapsing the fields together.
        */}
        <View style={{ marginBottom: 20 }}>
          <MedicircleLogo size="sm" />
        </View>

        <View style={{ marginBottom: 20 }}>
          <Text className="mb-2 text-xl font-semibold text-foreground">Forgot Password</Text>
          <Text className="text-sm text-muted-foreground">
            Enter your registered email address and we&apos;ll send a secure password reset link.
          </Text>
        </View>

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <FormControl isInvalid={!!errors.email} style={{ marginBottom: 20 }}>
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

        {forgotPasswordMutation.isError ? (
          <View style={{ marginBottom: 20 }}>
            <FormErrorBanner message="Couldn't send the reset link. Check the email and try again." />
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
          {forgotPasswordMutation.isPending ? <ButtonSpinner /> : null}
          <ButtonText className={isSubmitDisabled ? 'text-disabled-foreground' : undefined}>
            Send Reset Link
          </ButtonText>
        </Button>

        <Pressable onPress={() => router.back()} hitSlop={8} className="items-center py-2">
          <Text className="text-sm font-medium text-link">Back to Log In</Text>
        </Pressable>
      </Box>

      <ResetLinkSentSheet
        visible={showSuccess}
        email={getValues('email')}
        onClose={() => setShowSuccess(false)}
        onBackToSignIn={() => {
          setShowSuccess(false);
          router.replace('/login');
        }}
        onResend={onResend}
        isResending={forgotPasswordMutation.isPending}
      />
    </SafeAreaView>
  );
}
