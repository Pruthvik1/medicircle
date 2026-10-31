import { Feather } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { Redirect, router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LogoLoader } from '@/components/brand/logo-loader';
import { FormErrorBanner } from '@/components/forms/form-error-banner';
import { TextField } from '@/components/forms/text-field';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/context/auth-context';
import {
  useDoctorProfile,
  useUpdateDoctorProfile,
  type DoctorProfile,
} from '@/features/doctor/api';
import { doctorProfileSchema, type DoctorProfileValues } from '@/lib/schemas/doctor-profile';
import { SLOT_LENGTHS, SPECIALTIES, WEEKDAYS } from '@/lib/schemas/onboarding';

function EditForm({ profile }: { profile: DoctorProfile }) {
  const update = useUpdateDoctorProfile(profile.id, profile.clinic.id);

  const { control, handleSubmit, formState } = useForm<DoctorProfileValues>({
    resolver: zodResolver(doctorProfileSchema),
    mode: 'onTouched',
    defaultValues: {
      fullName: profile.fullName,
      phone: profile.phone,
      specialty: profile.specialty,
      registrationNo: profile.registrationNo,
      yearsExperience: String(profile.yearsExperience),
      consultationFee: String(profile.consultationFee),
      bio: profile.bio,
      clinicName: profile.clinic.name,
      clinicAddress: profile.clinic.address,
      autoApprove: profile.autoApprove,
      days: profile.availability.map((a) => a.weekday),
      startTime: profile.availability[0]?.startTime ?? '09:00',
      endTime: profile.availability[0]?.endTime ?? '17:00',
      slotMinutes: profile.availability[0]?.slotMinutes ?? 15,
    },
  });

  const save = handleSubmit((values) => update.mutate(values, { onSuccess: () => router.back() }));

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="mb-3 text-base font-semibold text-foreground">Personal</Text>
        <TextField control={control} name="fullName" label="Full name" autoCapitalize="words" />
        <TextField
          control={control}
          name="phone"
          label="Phone"
          required={false}
          placeholder="+91 98765 43210"
          keyboardType="phone-pad"
        />

        <Text className="mb-3 mt-2 text-base font-semibold text-foreground">Professional</Text>
        <Text className="mb-2 text-sm font-medium text-secondary-foreground">Specialty *</Text>
        <Controller
          control={control}
          name="specialty"
          render={({ field }) => (
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 8,
                marginBottom: 16,
              }}
            >
              {SPECIALTIES.map((s) => {
                const active = field.value === s;
                return (
                  <Pressable
                    key={s}
                    onPress={() => field.onChange(s)}
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
                      {s}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        />
        <TextField
          control={control}
          name="registrationNo"
          label="Medical registration no."
          autoCapitalize="characters"
        />
        <TextField
          control={control}
          name="yearsExperience"
          label="Years of experience"
          keyboardType="number-pad"
        />
        <TextField
          control={control}
          name="consultationFee"
          label="Consultation fee (₹)"
          keyboardType="number-pad"
        />
        <TextField
          control={control}
          name="bio"
          label="About you"
          required={false}
          multiline
          numberOfLines={3}
          maxLength={400}
        />

        <Text className="mb-3 mt-2 text-base font-semibold text-foreground">Clinic</Text>
        <TextField control={control} name="clinicName" label="Clinic name" autoCapitalize="words" />
        <TextField
          control={control}
          name="clinicAddress"
          label="Address"
          multiline
          numberOfLines={3}
        />

        <Text className="mb-3 mt-2 text-base font-semibold text-foreground">Timings</Text>
        <Text className="mb-2 text-sm font-medium text-secondary-foreground">Working days *</Text>
        <Controller
          control={control}
          name="days"
          render={({ field, fieldState }) => (
            <View style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {WEEKDAYS.map((d) => {
                  const on = field.value.includes(d.value);
                  return (
                    <Pressable
                      key={d.value}
                      onPress={() =>
                        field.onChange(
                          on ? field.value.filter((v) => v !== d.value) : [...field.value, d.value]
                        )
                      }
                      accessibilityRole="button"
                      accessibilityState={{ selected: on }}
                      className={
                        on
                          ? 'rounded-full border border-primary bg-primary px-3.5 py-2'
                          : 'rounded-full border border-border bg-background px-3.5 py-2'
                      }
                    >
                      <Text
                        className={
                          on
                            ? 'text-sm font-medium text-primary-foreground'
                            : 'text-sm text-secondary-foreground'
                        }
                      >
                        {d.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              {fieldState.error ? (
                <Text className="mt-1 text-xs text-destructive">{fieldState.error.message}</Text>
              ) : null}
            </View>
          )}
        />
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
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
              {SLOT_LENGTHS.map((m) => (
                <Pressable
                  key={m}
                  onPress={() => field.onChange(m)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: field.value === m }}
                  className={
                    field.value === m
                      ? 'rounded-full border border-primary bg-primary px-3.5 py-2'
                      : 'rounded-full border border-border bg-background px-3.5 py-2'
                  }
                >
                  <Text
                    className={
                      field.value === m
                        ? 'text-sm font-medium text-primary-foreground'
                        : 'text-sm text-secondary-foreground'
                    }
                  >
                    {m} min
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        />

        <Controller
          control={control}
          name="autoApprove"
          render={({ field }) => (
            <View className="flex-row items-center gap-3 rounded-2xl border border-border p-4">
              <View style={{ flex: 1 }}>
                <Text className="text-sm font-semibold text-foreground">Auto-approve bookings</Text>
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

        {update.isError ? (
          <View style={{ marginTop: 16 }}>
            <FormErrorBanner
              message={(update.error as Error)?.message || "Couldn't save changes. Try again."}
            />
          </View>
        ) : null}

        <Button
          onPress={save}
          isDisabled={update.isPending || !formState.isDirty}
          className="mt-6 w-full rounded-xl"
        >
          {update.isPending ? <ButtonSpinner /> : null}
          <ButtonText>Save changes</ButtonText>
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default function EditProfileScreen() {
  const { user } = useAuth();
  const { data, isLoading } = useDoctorProfile(user?.id);

  if (!user || user.role !== 'doctor') return <Redirect href="/" />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top', 'bottom']}>
      <View className="flex-row items-center gap-3 border-b border-border px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Feather name="arrow-left" size={24} color="#101828" />
        </Pressable>
        <Text className="text-lg font-semibold text-foreground">Edit profile</Text>
      </View>
      {isLoading || !data ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <LogoLoader size={56} />
        </View>
      ) : (
        <EditForm profile={data} />
      )}
    </SafeAreaView>
  );
}
