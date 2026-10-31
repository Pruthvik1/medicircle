import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, type ComponentType } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';
import { parseClinicQr } from '@/lib/clinic-qr';

type CameraScannerProps = {
  onClose: () => void;
  onClinic: (slug: string) => void;
};

// expo-camera throws on import when its native module isn't in the running
// build (e.g. some Expo Go versions). Load it lazily so the rest of the app
// is unaffected and patients can still type the clinic code.
let CameraScanner: ComponentType<CameraScannerProps> | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- lazy: see comment above
  CameraScanner = require('@/components/queue/camera-scanner').CameraScanner;
} catch {
  CameraScanner = null;
}

const goToQueue = (clinic: string) => router.replace({ pathname: '/queue', params: { clinic } });

function ManualEntry() {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const raw = code.trim();
    const slug = parseClinicQr(raw) ?? (/^[a-z0-9-]+$/i.test(raw) ? raw.toLowerCase() : null);
    if (!slug) return setError('Enter the clinic code or link shown at the front desk.');
    goToQueue(slug);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <Pressable onPress={() => router.back()} style={{ padding: 16 }} accessibilityLabel="Close">
        <Feather name="x" size={24} color="#101828" />
      </Pressable>
      <View style={{ flex: 1, padding: 24, gap: 12, justifyContent: 'center' }}>
        <Feather name="camera-off" size={36} color="#0F8BC0" />
        <Text className="text-xl font-semibold text-foreground">Camera scanner unavailable</Text>
        <Text className="text-sm text-muted-foreground">
          This version of the app can&apos;t open the camera. Enter the clinic code printed under
          the QR code instead.
        </Text>
        <TextInput
          value={code}
          onChangeText={(t) => {
            setCode(t);
            setError(null);
          }}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="e.g. mehta-family-clinic-a1b2c"
          placeholderTextColor="#667085"
          className="rounded-xl border border-border px-3 py-3 text-base text-foreground"
        />
        {error ? <Text className="text-xs text-destructive">{error}</Text> : null}
        <Pressable
          onPress={submit}
          accessibilityRole="button"
          className="items-center rounded-xl bg-primary py-3"
        >
          <Text className="text-sm font-semibold text-primary-foreground">Join queue</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

export default function ScanScreen() {
  return CameraScanner ? (
    <CameraScanner onClose={() => router.back()} onClinic={goToQueue} />
  ) : (
    <ManualEntry />
  );
}
