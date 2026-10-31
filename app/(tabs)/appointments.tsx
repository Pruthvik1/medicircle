import { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar, Card, PrimaryButton, ScreenHeader } from '@/components/app/ui';
import { PatientAppointments } from '@/components/patient/patient-appointments';
import { LogoLoader } from '@/components/brand/logo-loader';
import { RejectSheet } from '@/components/doctor/reject-sheet';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/context/auth-context';
import {
  useDecideRequest,
  usePendingCount,
  useRequests,
  type AppointmentRequest,
  type RequestStatus,
} from '@/features/doctor/requests-api';

const SEGMENTS: { key: RequestStatus; label: string }[] = [
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'declined', label: 'Rejected' },
];

const formatWhen = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });

function Requests({ doctorId }: { doctorId: string }) {
  const [segment, setSegment] = useState<RequestStatus>('pending');
  const [rejecting, setRejecting] = useState<AppointmentRequest | null>(null);
  const { data, isLoading, isError, refetch, isRefetching } = useRequests(doctorId, segment);
  const pending = usePendingCount(doctorId);
  const decide = useDecideRequest(doctorId);

  const empty = {
    pending: 'No requests waiting for you.',
    approved: 'No upcoming approved appointments.',
    declined: 'Nothing rejected yet.',
  }[segment];

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: 'row',
          gap: 8,
          paddingHorizontal: 20,
          paddingBottom: 8,
        }}
      >
        {SEGMENTS.map((seg) => {
          const active = seg.key === segment;
          const count = seg.key === 'pending' ? pending.data : 0;
          return (
            <Pressable
              key={seg.key}
              onPress={() => setSegment(seg.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              className={
                active
                  ? 'flex-row items-center gap-1.5 rounded-full bg-primary px-4 py-2'
                  : 'flex-row items-center gap-1.5 rounded-full border border-border px-4 py-2'
              }
            >
              <Text
                className={
                  active
                    ? 'text-sm font-medium text-primary-foreground'
                    : 'text-sm text-secondary-foreground'
                }
              >
                {seg.label}
              </Text>
              {count ? (
                <View className="min-w-5 items-center rounded-full bg-white px-1.5">
                  <Text className="text-xs font-semibold text-primary">{count}</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, gap: 12, flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />
        }
      >
        {isLoading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <LogoLoader size={48} />
          </View>
        ) : isError ? (
          <PrimaryButton
            label="Couldn't load — try again"
            icon="refresh-cw"
            onPress={() => void refetch()}
          />
        ) : data && data.length === 0 ? (
          <Text className="mt-8 text-center text-sm text-muted-foreground">{empty}</Text>
        ) : (
          data?.map((r) => (
            <Card key={r.id}>
              <View className="flex-row items-center gap-3">
                <Avatar name={r.patientName} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text className="text-base font-semibold text-foreground">{r.patientName}</Text>
                  <Text className="text-sm text-muted-foreground">{formatWhen(r.startsAt)}</Text>
                </View>
              </View>
              {r.reason ? <Text className="mt-3 text-sm text-foreground">{r.reason}</Text> : null}
              {r.status === 'declined' && r.decisionNote ? (
                <Text className="mt-3 rounded-lg bg-error-surface p-3 text-sm text-destructive">
                  Note sent: {r.decisionNote}
                </Text>
              ) : null}

              <View style={{ marginTop: 12, flexDirection: 'row', gap: 12 }}>
                {r.status !== 'declined' ? (
                  <View style={{ flex: 1 }}>
                    <PrimaryButton
                      variant="secondary"
                      label="Reject"
                      onPress={() => setRejecting(r)}
                    />
                  </View>
                ) : null}
                {r.status !== 'approved' ? (
                  <View style={{ flex: 1 }}>
                    <PrimaryButton
                      label={r.status === 'declined' ? 'Approve instead' : 'Approve'}
                      onPress={() => decide.mutate({ id: r.id, status: 'approved' })}
                      disabled={decide.isPending}
                    />
                  </View>
                ) : null}
              </View>
            </Card>
          ))
        )}
        {decide.isError ? (
          <Text className="text-center text-xs text-destructive">
            {(decide.error as Error)?.message}
          </Text>
        ) : null}
      </ScrollView>

      <RejectSheet
        patientName={rejecting?.patientName ?? ''}
        visible={!!rejecting}
        submitting={decide.isPending}
        onCancel={() => setRejecting(null)}
        onConfirm={(note) => {
          if (!rejecting) return;
          decide.mutate(
            { id: rejecting.id, status: 'declined', note },
            { onSuccess: () => setRejecting(null) }
          );
        }}
      />
    </View>
  );
}

export default function AppointmentsTab() {
  const { user } = useAuth();
  if (!user) return null;
  const patient = user.role === 'patient';
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
      <ScreenHeader
        title={patient ? 'Appointments' : 'Requests'}
        subtitle={patient ? 'Upcoming and past visits' : 'Approve or reject booking requests'}
      />
      {patient ? <PatientAppointments /> : <Requests doctorId={user.id} />}
    </SafeAreaView>
  );
}
