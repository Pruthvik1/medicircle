import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar, Card, ScreenHeader } from '@/components/app/ui';
import { PatientRecords } from '@/components/patient/patient-records';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/context/auth-context';
import { CLINIC_PATIENTS } from '@/features/home/mock';

function ClinicPatients() {
  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
      {CLINIC_PATIENTS.map((p) => (
        <Card key={p.id}>
          <View className="flex-row items-center gap-3">
            <Avatar name={p.name} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text className="text-base font-semibold text-foreground">{p.name}</Text>
              <Text className="text-sm text-muted-foreground">
                {p.visits} {p.visits === 1 ? 'visit' : 'visits'} · {p.lastVisit}
              </Text>
            </View>
            {p.returning ? (
              <View className="rounded-full bg-primary-soft px-2.5 py-1">
                <Text className="text-xs font-medium text-primary">Returning</Text>
              </View>
            ) : null}
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}

export default function RecordsTab() {
  const { user } = useAuth();
  if (!user) return null;
  const patient = user.role === 'patient';
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
      <ScreenHeader
        title={patient ? 'Records' : 'Patients'}
        subtitle={
          patient ? 'Prescriptions, reports and scans' : 'History, reports and prescriptions'
        }
      />
      {patient ? <PatientRecords /> : <ClinicPatients />}
    </SafeAreaView>
  );
}
