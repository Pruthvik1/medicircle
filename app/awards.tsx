import { Feather } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, PrimaryButton } from '@/components/app/ui';
import { LogoLoader } from '@/components/brand/logo-loader';
import { FormErrorBanner } from '@/components/forms/form-error-banner';
import { TextField } from '@/components/forms/text-field';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/context/auth-context';
import {
  awardSchema,
  useAwards,
  useDeleteAward,
  useSaveAward,
  type Award,
  type AwardValues,
} from '@/features/doctor/awards-api';

function AwardForm({
  doctorId,
  award,
  onClose,
}: {
  doctorId: string;
  award: Award | null;
  onClose: () => void;
}) {
  const save = useSaveAward(doctorId);
  const { control, handleSubmit } = useForm<AwardValues>({
    resolver: zodResolver(awardSchema),
    mode: 'onTouched',
    defaultValues: {
      title: award?.title ?? '',
      year: award ? String(award.year) : '',
      description: award?.description ?? '',
      linkUrl: award?.linkUrl ?? '',
    },
  });

  const submit = handleSubmit((values) =>
    save.mutate({ id: award?.id, values }, { onSuccess: onClose })
  );

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top', 'bottom']}>
        <View className="flex-row items-center gap-3 border-b border-border px-4 py-3">
          <Pressable
            onPress={onClose}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <Feather name="x" size={24} color="#101828" />
          </Pressable>
          <Text className="text-lg font-semibold text-foreground">
            {award ? 'Edit award' : 'Add award'}
          </Text>
        </View>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
            <TextField
              control={control}
              name="title"
              label="Award"
              placeholder="e.g. Best Physician 2025"
              autoCapitalize="words"
            />
            <TextField
              control={control}
              name="year"
              label="Year"
              placeholder="2025"
              keyboardType="number-pad"
              maxLength={4}
            />
            <TextField
              control={control}
              name="linkUrl"
              label="Proof link"
              required={false}
              placeholder="https://… award page or news article"
              keyboardType="url"
              autoCapitalize="none"
            />
            <Text className="-mt-2 mb-4 text-xs text-muted-foreground">
              Link the award page or an article about it. Patients see a Verified badge once our
              team has checked it.
            </Text>
            <TextField
              control={control}
              name="description"
              label="Details"
              required={false}
              placeholder="What was it for?"
              multiline
              numberOfLines={2}
              maxLength={200}
            />

            {award?.verified ? (
              <Text className="mb-4 rounded-lg bg-reward-soft p-3 text-xs text-reward">
                Saving changes sends this award back for verification.
              </Text>
            ) : null}
            {save.isError ? (
              <View style={{ marginBottom: 16 }}>
                <FormErrorBanner
                  message={(save.error as Error)?.message || "Couldn't save the award."}
                />
              </View>
            ) : null}
            <PrimaryButton
              label={save.isPending ? 'Saving…' : 'Save award'}
              onPress={submit}
              disabled={save.isPending}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

export default function AwardsScreen() {
  const { user } = useAuth();
  const { data, isLoading } = useAwards(user?.id);
  const remove = useDeleteAward(user?.id ?? '');
  const [editing, setEditing] = useState<Award | null | 'new'>(null);

  if (!user || user.role !== 'doctor') return <Redirect href="/" />;

  const confirmDelete = (a: Award) =>
    Alert.alert('Delete award?', a.title, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => remove.mutate(a.id) },
    ]);

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
        <Text className="flex-1 text-lg font-semibold text-foreground">Awards</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 12, flexGrow: 1 }}>
        {isLoading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <LogoLoader size={48} />
          </View>
        ) : data && data.length === 0 ? (
          <Text className="mt-8 text-center text-sm text-muted-foreground">
            No awards yet. Add one with a link so patients can check it.
          </Text>
        ) : (
          data?.map((a) => (
            <Card key={a.id}>
              <View className="flex-row items-start gap-3">
                <Feather name="award" size={22} color="#B54708" style={{ marginTop: 2 }} />
                <View style={{ flex: 1, gap: 4 }}>
                  <Text className="text-base font-semibold text-foreground">
                    {a.title} · {a.year}
                  </Text>
                  {a.description ? (
                    <Text className="text-sm text-muted-foreground">{a.description}</Text>
                  ) : null}
                  <View
                    className={
                      a.verified
                        ? 'self-start rounded-full bg-success px-2.5 py-1'
                        : 'self-start rounded-full bg-muted px-2.5 py-1'
                    }
                  >
                    <Text
                      className={
                        a.verified
                          ? 'text-xs font-medium text-success-foreground'
                          : 'text-xs font-medium text-muted-foreground'
                      }
                    >
                      {a.verified
                        ? 'Verified'
                        : a.linkUrl
                          ? 'Pending verification'
                          : 'Unverified — add a proof link'}
                    </Text>
                  </View>
                  {a.linkUrl ? (
                    <Pressable
                      onPress={() => void Linking.openURL(a.linkUrl)}
                      accessibilityRole="link"
                    >
                      <Text className="text-sm font-medium text-link" numberOfLines={1}>
                        {a.linkUrl}
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>
              <View style={{ marginTop: 12, flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <PrimaryButton
                    variant="secondary"
                    label="Edit"
                    icon="edit-2"
                    onPress={() => setEditing(a)}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <PrimaryButton
                    variant="secondary"
                    label="Delete"
                    icon="trash-2"
                    onPress={() => confirmDelete(a)}
                  />
                </View>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      <View style={{ padding: 16 }}>
        <PrimaryButton label="Add award" icon="plus" onPress={() => setEditing('new')} />
      </View>

      {editing ? (
        <AwardForm
          doctorId={user.id}
          award={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </SafeAreaView>
  );
}
