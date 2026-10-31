import { zodResolver } from '@hookform/resolvers/zod';
import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FormErrorBanner } from '@/components/forms/form-error-banner';
import { TextField } from '@/components/forms/text-field';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/context/auth-context';
import { useCompleteOnboardingMutation } from '@/features/auth/onboarding-api';
import {
  onboardingSchema,
  SLOT_LENGTHS,
  SPECIALTIES,
  STEP_FIELDS,
  WEEKDAYS,
  type OnboardingValues,
} from '@/lib/schemas/onboarding';

const STEP_TITLES = ['About you', 'Your clinic', 'Availability'];

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      className={
        active
          ? 'rounded-full border border-primary bg-primary px-3.5 py-2'
          : 'rounded-full border border-border bg-background px-3.5 py-2'
      }
    >
      <Text
        className={
          active
            ? 'text-sm font-medium text-primary-foreground'
            : 'text-sm text-secondary-foreground'
        }
      >
        {label}
      </Text>
    </Pressable>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? <Text className="mt-1 text-xs text-destructive">{message}</Text> : null;
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { user, refreshUser, signOut } = useAuth();
  const mutation = useCompleteOnboardingMutation();
  const [step, setStep] = useState(0);

  const { control, handleSubmit, trigger, formState } = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    mode: 'onTouched',
    defaultValues: {
      specialty: '',
      registrationNo: '',
      yearsExperience: '',
      consultationFee: '',
      bio: '',
      clinicName: '',
      clinicAddress: '',
      days: [1, 2, 3, 4, 5, 6],
      startTime: '09:00',
      endTime: '17:00',
      slotMinutes: 15,
      autoApprove: false,
    },
  });

  if (!user) return <Redirect href="/login" />;
  if (user.role !== 'doctor' || !user.needsOnboarding) return <Redirect href="/" />;

  const last = step === STEP_TITLES.length - 1;

  const next = async () => {
    if (await trigger(STEP_FIELDS[step])) setStep((s) => s + 1);
  };

  const submit = handleSubmit((values) =>
    mutation.mutate(values, {
      onSuccess: async () => {
        await refreshUser();
        router.replace('/');
      },
    })
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ flexDirection: 'row', gap: 6, marginBottom: 20 }}>
            {STEP_TITLES.map((t, i) => (
              <View
                key={t}
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: i <= step ? '#0F8BC0' : '#EAECF0',
                }}
              />
            ))}
          </View>
          <Text className="text-xs font-medium text-muted-foreground">
            Step {step + 1} of {STEP_TITLES.length}
          </Text>
          <Text className="mb-1 text-2xl font-bold text-foreground">{STEP_TITLES[step]}</Text>
          <Text className="mb-6 text-sm text-muted-foreground">
            {step === 0 && 'Patients see this on your profile.'}
            {step === 1 && 'Where patients will come to see you.'}
            {step === 2 && 'We turn this into bookable slots.'}
          </Text>

          {step === 0 ? (
            <>
              <Text className="mb-2 text-sm font-medium text-secondary-foreground">
                Specialty *
              </Text>
              <Controller
                control={control}
                name="specialty"
                render={({ field }) => (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {SPECIALTIES.map((s) => (
                      <Chip
                        key={s}
                        label={s}
                        active={field.value === s}
                        onPress={() => field.onChange(s)}
                      />
                    ))}
                  </View>
                )}
              />
              <FieldError message={formState.errors.specialty?.message} />
              <View style={{ height: 16 }} />
              <TextField
                control={control}
                name="registrationNo"
                label="Medical registration no."
                placeholder="e.g. MH-12345"
                autoCapitalize="characters"
              />
              <TextField
                control={control}
                name="yearsExperience"
                label="Years of experience"
                placeholder="e.g. 8"
                keyboardType="number-pad"
              />
              <TextField
                control={control}
                name="consultationFee"
                label="Consultation fee (₹)"
                placeholder="e.g. 500"
                keyboardType="number-pad"
              />
              <TextField
                control={control}
                name="bio"
                label="About you"
                required={false}
                placeholder="A short introduction for patients"
                multiline
                numberOfLines={3}
                maxLength={400}
              />
            </>
          ) : null}

          {step === 1 ? (
            <>
              <TextField
                control={control}
                name="clinicName"
                label="Clinic name"
                placeholder="e.g. Mehta Family Clinic"
                autoCapitalize="words"
              />
              <TextField
                control={control}
                name="clinicAddress"
                label="Address"
                placeholder="Street, area, city"
                multiline
                numberOfLines={3}
              />
            </>
          ) : null}

          {step === 2 ? (
            <>
              <Text className="mb-2 text-sm font-medium text-secondary-foreground">
                Working days *
              </Text>
              <Controller
                control={control}
                name="days"
                render={({ field }) => (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {WEEKDAYS.map((d) => {
                      const on = field.value.includes(d.value);
                      return (
                        <Chip
                          key={d.value}
                          label={d.label}
                          active={on}
                          onPress={() =>
                            field.onChange(
                              on
                                ? field.value.filter((v) => v !== d.value)
                                : [...field.value, d.value]
                            )
                          }
                        />
                      );
                    })}
                  </View>
                )}
              />
              <FieldError message={formState.errors.days?.message} />
              <View style={{ height: 16 }} />

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <TextField
                    control={control}
                    name="startTime"
                    label="Opens"
                    placeholder="09:00"
                    keyboardType="numbers-and-punctuation"
                    maxLength={5}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <TextField
                    control={control}
                    name="endTime"
                    label="Closes"
                    placeholder="17:00"
                    keyboardType="numbers-and-punctuation"
                    maxLength={5}
                  />
                </View>
              </View>

              <Text className="mb-2 text-sm font-medium text-secondary-foreground">
                Minutes per patient
              </Text>
              <Controller
                control={control}
                name="slotMinutes"
                render={({ field }) => (
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {SLOT_LENGTHS.map((m) => (
                      <Chip
                        key={m}
                        label={`${m} min`}
                        active={field.value === m}
                        onPress={() => field.onChange(m)}
                      />
                    ))}
                  </View>
                )}
              />

              <Controller
                control={control}
                name="autoApprove"
                render={({ field }) => (
                  <View className="mt-6 flex-row items-center gap-3 rounded-2xl border border-border p-4">
                    <View style={{ flex: 1 }}>
                      <Text className="text-sm font-semibold text-foreground">
                        Auto-approve bookings
                      </Text>
                      <Text className="mt-0.5 text-xs text-muted-foreground">
                        Off means you approve each request yourself.
                      </Text>
                    </View>
                    <Switch
                      value={field.value}
                      onValueChange={field.onChange}
                      trackColor={{ true: '#0F8BC0' }}
                    />
                  </View>
                )}
              />
            </>
          ) : null}

          {mutation.isError ? (
            <View style={{ marginTop: 16 }}>
              <FormErrorBanner
                message={
                  (mutation.error as Error)?.message || "Couldn't save your clinic. Try again."
                }
              />
            </View>
          ) : null}

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
            {step > 0 ? (
              <Button
                variant="outline"
                onPress={() => setStep((s) => s - 1)}
                className="flex-1 rounded-xl"
              >
                <ButtonText>Back</ButtonText>
              </Button>
            ) : null}
            <Button
              onPress={last ? submit : next}
              isDisabled={mutation.isPending}
              className="flex-1 rounded-xl"
            >
              {mutation.isPending ? <ButtonSpinner /> : null}
              <ButtonText>{last ? 'Finish setup' : 'Continue'}</ButtonText>
            </Button>
          </View>

          <Pressable
            onPress={() => void signOut()}
            hitSlop={8}
            style={{ marginTop: 24, alignItems: 'center' }}
          >
            <Text className="text-sm text-muted-foreground">Sign out</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
