import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';

import { NotificationBell } from '@/components/app/notification-bell';
import { ScreenHeader } from '@/components/app/ui';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/context/auth-context';
import { usePatientAppointments } from '@/features/patient/appointments-api';
import { matchesQuery, useDirectory } from '@/features/patient/directory-api';

import { EmptyState, ErrorState, Loading, Rating, Row, SectionLabel, Tile } from './patient-ui';

function formatVisit(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function NextVisit() {
  const { user } = useAuth();
  const { data } = usePatientAppointments(user?.id);
  const next = data
    ?.filter((a) => a.status === 'approved' && new Date(a.startsAt) > new Date())
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0];
  if (!next) return null;

  return (
    <View className="mt-4 rounded-2xl bg-primary p-5">
      <Text className="text-xs font-medium text-white/80">Next visit</Text>
      <Text className="mt-1 text-xl font-semibold text-white">{next.doctorName}</Text>
      <Text className="text-sm text-white/90">
        {next.specialty ? `${next.specialty} · ` : ''}
        {formatVisit(next.startsAt)}
      </Text>
      <Pressable
        onPress={() => router.push('/queue')}
        accessibilityRole="button"
        className="mt-4 self-start rounded-xl bg-white px-4 py-2.5"
      >
        <Text className="text-sm font-semibold text-primary">View live queue</Text>
      </Pressable>
    </View>
  );
}

export function PatientHome({ name }: { name: string }) {
  const { data, isLoading, isError, refetch } = useDirectory();
  const [query, setQuery] = useState('');
  const [specialty, setSpecialty] = useState<string | null>(null);
  const [clinicId, setClinicId] = useState<string | null>(null);

  const specialties = useMemo(
    () => [...new Set((data?.doctors ?? []).map((d) => d.specialty))].sort(),
    [data]
  );

  const doctors = useMemo(
    () =>
      (data?.doctors ?? [])
        .filter((d) => !specialty || d.specialty === specialty)
        .filter((d) => !clinicId || d.clinicId === clinicId)
        .filter((d) => matchesQuery(query, d.name, d.clinicName, d.specialty))
        .sort((a, b) => b.ratingAvg - a.ratingAvg),
    [data, query, specialty, clinicId]
  );

  const clinics = useMemo(
    () =>
      (data?.clinics ?? [])
        .filter((c) => !specialty || c.specialties.includes(specialty))
        .filter((c) => matchesQuery(query, c.name, c.address, ...c.doctors.map((d) => d.name)))
        .sort((a, b) => b.topRating - a.topRating),
    [data, query, specialty]
  );

  const selectedClinic = clinicId ? data?.clinics.find((c) => c.id === clinicId) : null;
  const searching = query.trim().length > 0 || !!specialty || !!clinicId;

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      <ScreenHeader
        title={`Hi, ${name.split(' ')[0]}`}
        subtitle="Find a doctor or clinic"
        right={
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable
              onPress={() => router.push('/scan')}
              accessibilityRole="button"
              accessibilityLabel="Scan clinic QR code to join a queue"
              className="h-11 w-11 items-center justify-center rounded-full bg-primary"
            >
              <Feather name="maximize" size={20} color="#FFFFFF" />
            </Pressable>
            <NotificationBell />
          </View>
        }
      />

      <View style={{ paddingHorizontal: 20 }}>
        <View className="h-12 flex-row items-center gap-2 rounded-2xl bg-muted px-4">
          <Feather name="search" size={18} color="#667085" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search doctor or clinic name"
            placeholderTextColor="#667085"
            returnKeyType="search"
            autoCorrect={false}
            accessibilityLabel="Search doctors and clinics"
            style={{ flex: 1, fontSize: 15, color: '#101828', paddingVertical: 0 }}
          />
          {query ? (
            <Pressable onPress={() => setQuery('')} hitSlop={10} accessibilityLabel="Clear search">
              <Feather name="x-circle" size={18} color="#98A2B3" />
            </Pressable>
          ) : null}
        </View>

        {!searching ? <NextVisit /> : null}

        {specialties.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingTop: 16 }}
          >
            {[null, ...specialties].map((s) => {
              const active = s === specialty;
              return (
                <Pressable
                  key={s ?? 'all'}
                  onPress={() => setSpecialty(s)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  className={
                    active
                      ? 'rounded-full bg-foreground px-4 py-2'
                      : 'rounded-full border border-border px-4 py-2'
                  }
                >
                  <Text
                    className={
                      active
                        ? 'text-sm font-medium text-white'
                        : 'text-sm text-secondary-foreground'
                    }
                  >
                    {s ?? 'All'}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        ) : null}

        {isLoading ? (
          <View style={{ height: 240 }}>
            <Loading />
          </View>
        ) : isError ? (
          <View style={{ height: 240 }}>
            <ErrorState what="clinics" onRetry={() => void refetch()} />
          </View>
        ) : (data?.doctors.length ?? 0) === 0 ? (
          <View style={{ height: 280 }}>
            <EmptyState
              title="No clinics yet"
              body="Doctors who join medicircle will show up here."
            />
          </View>
        ) : (
          <>
            {!selectedClinic ? (
              <>
                <SectionLabel title="Clinics" hint={`${clinics.length} found`} />
                {clinics.length === 0 ? (
                  <Text className="py-4 text-sm text-muted-foreground">
                    No clinic matches &ldquo;{query}&rdquo;.
                  </Text>
                ) : (
                  clinics.map((c, i) => (
                    <Row
                      key={c.id}
                      last={i === clinics.length - 1}
                      onPress={() => setClinicId(c.id)}
                    >
                      <Tile label={c.name} />
                      <View style={{ flex: 1, gap: 2 }}>
                        <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
                          {c.name}
                        </Text>
                        <Text className="text-sm text-muted-foreground" numberOfLines={1}>
                          {c.address || 'Address not added'}
                        </Text>
                        <Text className="text-xs text-placeholder" numberOfLines={1}>
                          {c.doctors.length} {c.doctors.length === 1 ? 'doctor' : 'doctors'} ·{' '}
                          {c.specialties.join(', ')}
                        </Text>
                      </View>
                      <Feather name="chevron-right" size={18} color="#98A2B3" />
                    </Row>
                  ))
                )}
              </>
            ) : (
              <Pressable
                onPress={() => setClinicId(null)}
                accessibilityRole="button"
                className="mt-5 flex-row items-center gap-2 self-start rounded-full bg-primary-soft px-3.5 py-2"
              >
                <Text className="text-sm font-medium text-primary">{selectedClinic.name}</Text>
                <Feather name="x" size={14} color="#0F8BC0" />
              </Pressable>
            )}

            <SectionLabel title="Doctors" hint={`${doctors.length} found`} />
            {doctors.length === 0 ? (
              <Text className="py-4 text-sm text-muted-foreground">
                No doctor matches your search.
              </Text>
            ) : (
              doctors.map((d, i) => (
                <Row
                  key={d.id}
                  last={i === doctors.length - 1}
                  onPress={() => router.push({ pathname: '/doctor/[id]', params: { id: d.id } })}
                >
                  <Tile label={d.name} tone="solid" />
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
                      Dr. {d.name.replace(/^Dr\.?\s+/i, '')}
                    </Text>
                    <Text className="text-sm text-muted-foreground" numberOfLines={1}>
                      {d.specialty} · {d.clinicName}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 2 }}>
                    <Rating value={d.ratingAvg} count={d.ratingCount} />
                    <Text className="text-xs text-muted-foreground">₹{d.fee}</Text>
                  </View>
                </Row>
              ))
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}
