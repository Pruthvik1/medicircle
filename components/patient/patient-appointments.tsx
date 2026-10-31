import { router } from 'expo-router';
import { RefreshControl, ScrollView, View } from 'react-native';

import { StatusPill } from '@/components/app/ui';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/context/auth-context';
import {
  usePatientAppointments,
  type PatientAppointment,
} from '@/features/patient/appointments-api';

import { EmptyState, ErrorState, Loading, Row, SectionLabel } from './patient-ui';

const PILL = {
  pending: 'pending',
  approved: 'approved',
  completed: 'completed',
  declined: 'declined',
  cancelled: 'declined',
  no_show: 'declined',
} as const;

function DateTile({ iso }: { iso: string }) {
  const d = new Date(iso);
  return (
    <View className="h-14 w-14 items-center justify-center rounded-xl bg-primary-soft">
      <Text className="text-lg font-bold leading-6 text-primary">{d.getDate()}</Text>
      <Text className="text-[10px] font-semibold uppercase text-primary">
        {d.toLocaleString('en-IN', { month: 'short' })}
      </Text>
    </View>
  );
}

function AppointmentRow({ a, last }: { a: PatientAppointment; last: boolean }) {
  const time = new Date(a.startsAt).toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
  });
  return (
    <Row last={last}>
      <DateTile iso={a.startsAt} />
      <View style={{ flex: 1, gap: 3 }}>
        <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
          Dr. {a.doctorName.replace(/^Dr\.?\s+/i, '')}
        </Text>
        <Text className="text-sm text-muted-foreground" numberOfLines={1}>
          {a.specialty ? `${a.specialty} · ` : ''}
          {time}
        </Text>
        <StatusPill status={PILL[a.status]} />
        {a.status === 'declined' && a.decisionNote ? (
          <Text className="text-sm text-destructive">{a.decisionNote}</Text>
        ) : null}
      </View>
    </Row>
  );
}

export function PatientAppointments() {
  const { user } = useAuth();
  const { data, isLoading, isError, refetch, isRefetching } = usePatientAppointments(user?.id);

  if (isLoading) return <Loading />;
  if (isError) return <ErrorState what="your appointments" onRetry={() => void refetch()} />;
  if (!data || data.length === 0) {
    return (
      <EmptyState
        title="No appointments yet"
        body="Find a doctor and your bookings will show up here."
        action={{ label: 'Find a doctor', onPress: () => router.navigate('/home') }}
      />
    );
  }

  const now = new Date();
  const isUpcoming = (a: PatientAppointment) =>
    new Date(a.startsAt) >= now && (a.status === 'pending' || a.status === 'approved');
  const upcoming = data.filter(isUpcoming).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const past = data.filter((a) => !isUpcoming(a));

  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />}
    >
      {upcoming.length > 0 ? (
        <>
          <SectionLabel title="Upcoming" />
          {upcoming.map((a, i) => (
            <AppointmentRow key={a.id} a={a} last={i === upcoming.length - 1} />
          ))}
        </>
      ) : null}
      {past.length > 0 ? (
        <>
          <SectionLabel title="Past" />
          {past.map((a, i) => (
            <AppointmentRow key={a.id} a={a} last={i === past.length - 1} />
          ))}
        </>
      ) : null}
    </ScrollView>
  );
}
