import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar, Card, PrimaryButton, ScreenHeader } from '@/components/app/ui';
import { Text } from '@/components/ui/text';
import { DoctorProfileView } from '@/components/doctor/doctor-profile-view';
import { useAuth } from '@/context/auth-context';

const ROLE_LABEL = {
  patient: 'Patient',
  doctor: 'Doctor',
  staff: 'Clinic staff',
} as const;

export default function ProfileTab() {
  const { user, signOut } = useAuth();
  if (!user) return null;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
      <ScreenHeader title="Profile" />
      {user.role === 'doctor' ? (
        <DoctorProfileView />
      ) : (
        <View style={{ padding: 20, gap: 16 }}>
          <Card>
            <View className="flex-row items-center gap-3">
              <Avatar name={user.name} />
              <View style={{ flex: 1 }}>
                <Text className="text-base font-semibold text-foreground">{user.name}</Text>
                <Text className="text-sm text-muted-foreground">{user.email}</Text>
                <Text className="mt-1 text-xs font-medium text-primary">
                  {ROLE_LABEL[user.role]}
                </Text>
              </View>
            </View>
          </Card>
          <PrimaryButton
            variant="secondary"
            label="Sign out"
            icon="log-out"
            onPress={() => void signOut()}
          />
        </View>
      )}
    </SafeAreaView>
  );
}
