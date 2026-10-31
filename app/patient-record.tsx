import { Feather } from '@expo/vector-icons';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, PrimaryButton, SectionTitle } from '@/components/app/ui';
import { LogoLoader } from '@/components/brand/logo-loader';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/context/auth-context';
import { usePatientHistory } from '@/features/doctor/history-api';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

// Doctor's view of a patient they are seeing: basics + previous prescriptions.
export default function PatientRecordScreen() {
  const { user } = useAuth();
  const { patient, name, entry } = useLocalSearchParams<{
    patient?: string;
    name?: string;
    entry?: string;
  }>();
  const { data, isLoading, isError, refetch } = usePatientHistory(patient);

  if (!user || user.role !== 'doctor') return <Redirect href="/" />;

  const basics = [data?.age ? `${data.age} yrs` : null, data?.gender, data?.bloodGroup].filter(
    Boolean
  );

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
          <Text className="text-lg font-semibold text-foreground">{name ?? 'Patient'}</Text>
          <Text className="text-xs text-muted-foreground">Medical record</Text>
        </View>
      </View>

      {!patient ? (
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 8 }}
        >
          <Text className="text-base font-semibold text-foreground">No account, no history</Text>
          <Text className="text-center text-sm text-muted-foreground">
            This walk-in patient hasn&apos;t registered, so there are no past records to show.
          </Text>
        </View>
      ) : isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <LogoLoader size={56} />
        </View>
      ) : isError || !data ? (
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 }}
        >
          <Text className="text-base font-semibold text-foreground">
            Couldn&apos;t load the record
          </Text>
          <PrimaryButton label="Try again" icon="refresh-cw" onPress={() => void refetch()} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 40 }}>
          <Card>
            <Text className="text-sm text-foreground">
              {basics.length ? basics.join(' · ') : 'No details added by the patient'}
            </Text>
            <Text className="mt-3 text-xs font-medium text-muted-foreground">Allergies</Text>
            {data.allergies.length ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                {data.allergies.map((a) => (
                  <View key={a} className="rounded-full bg-error-surface px-3 py-1">
                    <Text className="text-xs font-medium text-destructive">{a}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text className="mt-1 text-sm text-foreground">None reported</Text>
            )}
          </Card>

          <View style={{ gap: 12 }}>
            <SectionTitle>Previous prescriptions</SectionTitle>
            {data.prescriptions.length === 0 ? (
              <Text className="text-sm text-muted-foreground">
                You haven&apos;t prescribed anything for this patient yet.
              </Text>
            ) : (
              data.prescriptions.map((rx) => (
                <Card key={rx.id}>
                  <View className="flex-row items-center justify-between">
                    <Text className="flex-1 text-base font-semibold text-foreground">
                      {rx.diagnosis}
                    </Text>
                    <Text className="text-xs text-muted-foreground">
                      {formatDate(rx.createdAt)}
                    </Text>
                  </View>
                  <View style={{ marginTop: 10, gap: 8 }}>
                    {rx.items.map((i) => (
                      <View key={i.id}>
                        <Text className="text-sm font-medium text-foreground">
                          {i.medicine}
                          {i.dose ? ` · ${i.dose}` : ''}
                        </Text>
                        <Text className="text-xs text-muted-foreground">
                          {[i.frequency, i.duration, i.instructions].filter(Boolean).join(' · ')}
                        </Text>
                      </View>
                    ))}
                  </View>
                  {rx.notes ? (
                    <Text className="mt-3 text-sm text-muted-foreground">{rx.notes}</Text>
                  ) : null}
                  {rx.followUp ? (
                    <Text className="mt-2 text-xs font-medium text-link">
                      Follow-up: {formatDate(rx.followUp)}
                    </Text>
                  ) : null}
                </Card>
              ))
            )}
          </View>

          <Card>
            <Text className="text-sm font-semibold text-foreground">Reports and scans</Text>
            <Text className="mt-1 text-sm text-muted-foreground">
              Reports the patient chooses to share will appear here.
            </Text>
          </Card>

          {entry ? (
            <PrimaryButton
              label="Write prescription"
              icon="file-plus"
              onPress={() => router.replace({ pathname: '/prescription', params: { entry } })}
            />
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
