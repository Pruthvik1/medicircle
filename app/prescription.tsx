import { Feather } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/app/ui';
import { LogoLoader } from '@/components/brand/logo-loader';
import { FormErrorBanner } from '@/components/forms/form-error-banner';
import { TextField } from '@/components/forms/text-field';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/context/auth-context';
import {
  prescriptionSchema,
  useCreatePrescription,
  useQueuePatient,
  type PrescriptionValues,
  type QueuePatient,
} from '@/features/doctor/prescription-api';

const TIMES = ['Morning', 'Afternoon', 'Night'] as const;
const EMPTY_MEDICINE = { medicine: '', dose: '', frequency: '', duration: '', instructions: '' };
const INSTRUCTIONS = ['After food', 'Before food', 'With water', 'At bedtime'];

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      className={
        active
          ? 'rounded-full border border-primary bg-primary px-3 py-1.5'
          : 'rounded-full border border-border bg-background px-3 py-1.5'
      }
    >
      <Text
        className={
          active
            ? 'text-xs font-medium text-primary-foreground'
            : 'text-xs text-secondary-foreground'
        }
      >
        {label}
      </Text>
    </Pressable>
  );
}

function Form({ patient }: { patient: QueuePatient }) {
  const create = useCreatePrescription();
  const { control, handleSubmit, formState } = useForm<PrescriptionValues>({
    resolver: zodResolver(prescriptionSchema),
    mode: 'onTouched',
    defaultValues: { diagnosis: '', notes: '', followUp: '', items: [EMPTY_MEDICINE] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const save = handleSubmit((values) =>
    create.mutate({ patient, values }, { onSuccess: () => router.back() })
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        <TextField
          control={control}
          name="diagnosis"
          label="Diagnosis"
          placeholder="e.g. Viral fever"
          autoCapitalize="sentences"
        />

        <Text className="mb-3 text-base font-semibold text-foreground">Medicines</Text>
        {fields.map((field, index) => (
          <View key={field.id} className="mb-4 rounded-2xl border border-border p-4">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-sm font-semibold text-foreground">Medicine {index + 1}</Text>
              {fields.length > 1 ? (
                <Pressable
                  onPress={() => remove(index)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove medicine ${index + 1}`}
                >
                  <Feather name="trash-2" size={18} color="#D92D20" />
                </Pressable>
              ) : null}
            </View>
            <TextField
              control={control}
              name={`items.${index}.medicine`}
              label="Name and strength"
              placeholder="e.g. Paracetamol 500mg"
            />
            <TextField
              control={control}
              name={`items.${index}.dose`}
              label="Dose"
              required={false}
              placeholder="e.g. 1 tablet"
            />
            <Text className="mb-2 text-sm font-medium text-secondary-foreground">When *</Text>
            <Controller
              control={control}
              name={`items.${index}.frequency`}
              render={({ field: f, fieldState }) => {
                const selected = f.value ? f.value.split(', ').filter(Boolean) : [];
                const toggle = (t: string) => {
                  const next = selected.includes(t)
                    ? selected.filter((x) => x !== t)
                    : TIMES.filter((x) => x === t || selected.includes(x));
                  f.onChange(next.join(', '));
                };
                return (
                  <View style={{ marginBottom: 16 }}>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {TIMES.map((t) => (
                        <Chip
                          key={t}
                          label={t}
                          active={selected.includes(t)}
                          onPress={() => toggle(t)}
                        />
                      ))}
                    </View>
                    {fieldState.error ? (
                      <Text className="mt-1 text-xs text-destructive">
                        {fieldState.error.message}
                      </Text>
                    ) : null}
                  </View>
                );
              }}
            />
            <TextField
              control={control}
              name={`items.${index}.duration`}
              label="Duration"
              placeholder="e.g. 5 days"
            />
            <Controller
              control={control}
              name={`items.${index}.instructions`}
              render={({ field: f }) => (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {INSTRUCTIONS.map((i) => (
                    <Chip
                      key={i}
                      label={i}
                      active={f.value === i}
                      onPress={() => f.onChange(f.value === i ? '' : i)}
                    />
                  ))}
                </View>
              )}
            />
          </View>
        ))}
        {formState.errors.items?.message ? (
          <Text className="mb-2 text-xs text-destructive">{formState.errors.items.message}</Text>
        ) : null}
        <PrimaryButton
          variant="secondary"
          label="Add another medicine"
          icon="plus"
          onPress={() => append(EMPTY_MEDICINE)}
        />

        <View style={{ height: 24 }} />
        <TextField
          control={control}
          name="notes"
          label="Advice and notes"
          required={false}
          placeholder="Rest, fluids, tests to get…"
          multiline
          numberOfLines={3}
          maxLength={500}
        />
        <TextField
          control={control}
          name="followUp"
          label="Follow-up date"
          required={false}
          placeholder="YYYY-MM-DD"
          keyboardType="numbers-and-punctuation"
          maxLength={10}
        />

        {create.isError ? (
          <View style={{ marginBottom: 16 }}>
            <FormErrorBanner
              message={(create.error as Error)?.message || "Couldn't save the prescription."}
            />
          </View>
        ) : null}

        <PrimaryButton
          label={create.isPending ? 'Saving…' : 'Save prescription'}
          icon="check"
          onPress={save}
          disabled={create.isPending}
        />
        {patient.patientId ? (
          <Text className="mt-3 text-center text-xs text-muted-foreground">
            {patient.name} will be notified and can see it in their records.
          </Text>
        ) : (
          <Text className="mt-3 text-center text-xs text-muted-foreground">
            {patient.name} has no account, so this is saved to your records only.
          </Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default function PrescriptionScreen() {
  const { user } = useAuth();
  const { entry } = useLocalSearchParams<{ entry?: string }>();
  const { data, isLoading, isError } = useQueuePatient(entry);

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
        <View style={{ flex: 1 }}>
          <Text className="text-lg font-semibold text-foreground">Prescription</Text>
          {data ? <Text className="text-xs text-muted-foreground">For {data.name}</Text> : null}
        </View>
      </View>
      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <LogoLoader size={56} />
        </View>
      ) : isError || !data ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <Text className="text-base font-semibold text-foreground">
            Couldn&apos;t find that patient
          </Text>
        </View>
      ) : (
        <Form patient={data} />
      )}
    </SafeAreaView>
  );
}
