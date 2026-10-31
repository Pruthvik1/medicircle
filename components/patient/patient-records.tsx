import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { useAuth } from '@/context/auth-context';
import { usePatientPrescriptions } from '@/features/patient/appointments-api';

import { EmptyState, ErrorState, Loading, SectionLabel } from './patient-ui';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export function PatientRecords() {
  const { user } = useAuth();
  const { data, isLoading, isError, refetch, isRefetching } = usePatientPrescriptions(user?.id);
  const [open, setOpen] = useState<string | null>(null);

  if (isLoading) return <Loading />;
  if (isError) return <ErrorState what="your records" onRetry={() => void refetch()} />;
  if (!data || data.length === 0) {
    return (
      <EmptyState
        title="No records yet"
        body="Prescriptions from your doctors will appear here after a visit."
      />
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />}
    >
      <SectionLabel title="Prescriptions" hint={`${data.length}`} />
      {data.map((rx, i) => {
        const expanded = open === rx.id;
        return (
          <View key={rx.id} className={i === data.length - 1 ? '' : 'border-b border-border'}>
            <Pressable
              onPress={() => setOpen(expanded ? null : rx.id)}
              accessibilityRole="button"
              accessibilityState={{ expanded }}
              className="flex-row items-center gap-3 py-3.5"
            >
              <View style={{ flex: 1, gap: 2 }}>
                <Text className="text-base font-semibold text-foreground">{rx.diagnosis}</Text>
                <Text className="text-sm text-muted-foreground">
                  Dr. {rx.doctorName.replace(/^Dr\.?\s+/i, '')} · {formatDate(rx.createdAt)}
                </Text>
              </View>
              <Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color="#98A2B3" />
            </Pressable>
            {expanded ? (
              <View style={{ gap: 12, paddingBottom: 16 }}>
                {rx.items.map((m) => (
                  <View key={m.id}>
                    <Text className="text-sm font-medium text-foreground">
                      {m.medicine}
                      {m.dose ? ` · ${m.dose}` : ''}
                    </Text>
                    <Text className="text-xs text-muted-foreground">
                      {[m.frequency, m.duration, m.instructions].filter(Boolean).join(' · ')}
                    </Text>
                  </View>
                ))}
                {rx.notes ? (
                  <Text className="text-sm text-muted-foreground">{rx.notes}</Text>
                ) : null}
                {rx.followUp ? (
                  <Text className="text-xs font-medium text-link">
                    Follow-up: {formatDate(rx.followUp)}
                  </Text>
                ) : null}
              </View>
            ) : null}
          </View>
        );
      })}

      <SectionLabel title="Reports and scans" />
      <Text className="text-sm text-muted-foreground">
        Upload lab reports and scans here to share them with your doctor. Coming soon.
      </Text>
    </ScrollView>
  );
}
