import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, IconBadge, PrimaryButton, ScreenHeader, Stat } from '@/components/app/ui';
import { PatientHome } from '@/components/patient/patient-home';
import { LogoLoader } from '@/components/brand/logo-loader';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/context/auth-context';
import { useCallNext, useDoctorDashboard } from '@/features/doctor/dashboard-api';

function ClinicHome({ doctorId }: { doctorId: string }) {
  const { data, isLoading, isError, refetch } = useDoctorDashboard(doctorId);
  const callNext = useCallNext(doctorId);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <LogoLoader size={56} />
      </View>
    );
  }
  if (isError || !data) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 32,
          gap: 12,
        }}
      >
        <Text className="text-base font-semibold text-foreground">
          Couldn&apos;t load today&apos;s clinic
        </Text>
        <PrimaryButton label="Try again" icon="refresh-cw" onPress={() => void refetch()} />
      </View>
    );
  }

  const canCall = data.waiting > 0 || !!data.serving;

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
      <ScreenHeader title="Today" subtitle="Your clinic at a glance" />
      <View style={{ paddingHorizontal: 20, gap: 20, marginTop: 8 }}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Stat icon="calendar" label="Appointments" value={String(data.appointmentsToday)} />
          <Stat icon="users" label="Waiting now" value={String(data.waiting)} />
        </View>
        <Stat
          icon="trending-up"
          label="Revenue today"
          value={`₹${data.revenueToday.toLocaleString('en-IN')}`}
        />

        <Card>
          <Text className="text-xs font-medium text-muted-foreground">Now serving</Text>
          <Text className="mt-1 text-lg font-semibold text-foreground">
            {data.serving?.name ?? 'No one yet'}
          </Text>
          <Text className="mt-1 text-sm text-muted-foreground">
            {data.nextUp ? `Up next: ${data.nextUp}` : 'Nobody is waiting'}
          </Text>
          {callNext.isError ? (
            <Text className="mt-2 text-xs text-destructive">
              {(callNext.error as Error)?.message || "Couldn't call the next patient."}
            </Text>
          ) : null}
          <View style={{ marginTop: 16, gap: 12 }}>
            {data.serving ? (
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <PrimaryButton
                    variant="secondary"
                    label="History"
                    icon="clock"
                    onPress={() =>
                      router.push({
                        pathname: '/patient-record',
                        params: {
                          patient: data.serving?.patientId ?? '',
                          name: data.serving?.name,
                          entry: data.serving?.entryId,
                        },
                      })
                    }
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <PrimaryButton
                    variant="secondary"
                    label="Prescribe"
                    icon="file-plus"
                    onPress={() =>
                      router.push({
                        pathname: '/prescription',
                        params: { entry: data.serving?.entryId },
                      })
                    }
                  />
                </View>
              </View>
            ) : null}
            <PrimaryButton
              label={data.waiting > 0 ? 'Call next patient' : 'Finish current patient'}
              icon="arrow-right"
              onPress={() => callNext.mutate()}
              disabled={!canCall || callNext.isPending}
            />
          </View>
        </Card>

        <Card>
          <View className="flex-row items-center gap-3">
            <IconBadge name="grid" />
            <View style={{ flex: 1 }}>
              <Text className="text-base font-semibold text-foreground">Clinic QR code</Text>
              <Text className="text-sm text-muted-foreground">
                Walk-in patients scan to join the queue
              </Text>
            </View>
          </View>
          <View style={{ marginTop: 16 }}>
            <PrimaryButton
              variant="secondary"
              label="Show QR"
              icon="maximize"
              onPress={() => router.push('/clinic-qr')}
            />
          </View>
        </Card>
      </View>
    </ScrollView>
  );
}

export default function HomeTab() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
      {user.role === 'patient' ? (
        <PatientHome name={user.name} />
      ) : (
        <ClinicHome doctorId={user.id} />
      )}
    </SafeAreaView>
  );
}
