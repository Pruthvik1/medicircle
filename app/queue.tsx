import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DoctorDrawer } from '@/components/queue/doctor-drawer';
import { Text } from '@/components/ui/text';
import { MOCK_QUEUE } from '@/features/queue/mock';

// Live queue position for a checked-in patient. Mock data for now — swap
// MOCK_QUEUE for a supabase realtime subscription on queue_entries.
export default function QueueScreen() {
  const { token, ahead, avgMinutesPerPatient, nowServing, doctor } = MOCK_QUEUE;
  const waitMinutes = ahead * avgMinutesPerPatient;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          padding: 16,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Feather name="arrow-left" size={24} color="#101828" />
        </Pressable>
        <Text className="text-lg font-semibold text-foreground">Your queue</Text>
      </View>

      <View style={{ paddingHorizontal: 20, gap: 20 }}>
        <View className="items-center gap-2 rounded-3xl bg-primary-soft px-6 py-8">
          <Text className="text-sm font-medium text-muted-foreground">Your token</Text>
          <Text className="text-6xl font-bold text-primary">#{token}</Text>
          <Text className="text-base font-semibold text-foreground">
            {ahead === 0
              ? "You're next"
              : `${ahead} ${ahead === 1 ? 'patient' : 'patients'} ahead of you`}
          </Text>
          <Text className="text-sm text-muted-foreground">
            {ahead === 0 ? 'Please be ready' : `About ${waitMinutes} min wait`}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View className="flex-1 rounded-2xl border border-border p-4">
            <Text className="text-xs text-muted-foreground">Now serving</Text>
            <Text className="text-2xl font-semibold text-foreground">#{nowServing}</Text>
          </View>
          <View className="flex-1 rounded-2xl border border-border p-4">
            <Text className="text-xs text-muted-foreground">Clinic</Text>
            <Text className="text-base font-semibold text-foreground" numberOfLines={2}>
              {doctor.clinic}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          className="items-center rounded-xl border border-border py-3"
        >
          <Text className="text-sm font-semibold text-secondary-foreground">Leave queue</Text>
        </Pressable>
      </View>

      <DoctorDrawer doctor={doctor} />
    </SafeAreaView>
  );
}
