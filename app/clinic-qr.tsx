import { Feather } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import { Pressable, Share, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/app/ui';
import { LogoLoader } from '@/components/brand/logo-loader';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/context/auth-context';
import { useDoctorProfile } from '@/features/doctor/api';
import { buildClinicUrl } from '@/lib/clinic-qr';

// Doctor shows this at the front desk; walk-in patients scan it to join the queue.
export default function ClinicQrScreen() {
  const { user } = useAuth();
  const { data, isLoading, isError, refetch } = useDoctorProfile(user?.id);

  if (!user || user.role !== 'doctor') return <Redirect href="/" />;

  const url = data ? buildClinicUrl(data.clinic.slug) : '';

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
        <Text className="text-lg font-semibold text-foreground">Clinic QR code</Text>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <LogoLoader size={56} />
        </View>
      ) : isError || !data ? (
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
            Couldn&apos;t load your clinic
          </Text>
          <PrimaryButton label="Try again" icon="refresh-cw" onPress={() => void refetch()} />
        </View>
      ) : (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            gap: 20,
          }}
        >
          <Text className="text-center text-xl font-bold text-foreground">{data.clinic.name}</Text>
          <View className="rounded-3xl border border-border bg-white p-6">
            <QRCode value={url} size={240} color="#101828" backgroundColor="#FFFFFF" />
          </View>
          <Text className="text-center text-sm text-muted-foreground">
            Patients scan this in the medicircle app, or with their phone camera, to join
            today&apos;s queue.
          </Text>
          <View className="items-center rounded-xl bg-primary-soft px-4 py-3">
            <Text className="text-xs text-muted-foreground">Clinic code</Text>
            <Text selectable className="text-base font-semibold text-foreground">
              {data.clinic.slug}
            </Text>
          </View>
          <View style={{ width: '100%' }}>
            <PrimaryButton
              label="Share link"
              icon="share-2"
              onPress={() =>
                void Share.share({
                  message: `Join the queue at ${data.clinic.name}: ${url}`,
                  url,
                })
              }
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
