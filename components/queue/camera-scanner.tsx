import { Feather } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import { Linking, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';
import { parseClinicQr } from '@/lib/clinic-qr';

// Camera half of the scan screen, kept in its own file because expo-camera
// throws at import time in builds that don't include the native module.
export function CameraScanner({
  onClose,
  onClinic,
}: {
  onClose: () => void;
  onClinic: (slug: string) => void;
}) {
  const [permission, requestPermission] = useCameraPermissions();
  const [error, setError] = useState<string | null>(null);
  const handled = useRef(false);

  const onScanned = ({ data }: { data: string }) => {
    if (handled.current) return;
    const clinic = parseClinicQr(data);
    if (!clinic) {
      setError("That QR code isn't a medicircle clinic code.");
      return;
    }
    handled.current = true;
    onClinic(clinic);
  };

  const Close = (
    <Pressable
      onPress={() => onClose()}
      accessibilityRole="button"
      accessibilityLabel="Close scanner"
      style={{ position: 'absolute', top: 16, left: 16, zIndex: 2 }}
      className="h-10 w-10 items-center justify-center rounded-full bg-black/50"
    >
      <Feather name="x" size={22} color="#FFFFFF" />
    </Pressable>
  );

  if (!permission) return <View style={{ flex: 1, backgroundColor: '#000' }} />;

  if (!permission.granted) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <Pressable onPress={() => onClose()} style={{ padding: 16 }} accessibilityLabel="Close">
          <Feather name="x" size={24} color="#101828" />
        </Pressable>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 32,
            gap: 12,
          }}
        >
          <Feather name="camera-off" size={40} color="#0F8BC0" />
          <Text className="text-lg font-semibold text-foreground">Camera access needed</Text>
          <Text className="text-center text-sm text-muted-foreground">
            Allow the camera to scan the QR code at the clinic and join the queue.
          </Text>
          <Pressable
            onPress={() => (permission.canAskAgain ? requestPermission() : Linking.openSettings())}
            accessibilityRole="button"
            className="mt-2 rounded-xl bg-primary px-5 py-3"
          >
            <Text className="text-sm font-semibold text-primary-foreground">
              {permission.canAskAgain ? 'Allow camera' : 'Open settings'}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={onScanned}
      />
      <SafeAreaView style={{ position: 'absolute', inset: 0 }} pointerEvents="box-none">
        {Close}
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
          pointerEvents="none"
        >
          <View
            style={{
              width: 240,
              height: 240,
              borderRadius: 24,
              borderWidth: 3,
              borderColor: '#FFFFFF',
            }}
          />
        </View>
        <View
          style={{
            alignItems: 'center',
            paddingHorizontal: 24,
            paddingBottom: 48,
            gap: 8,
          }}
          pointerEvents="none"
        >
          <Text className="text-base font-semibold text-white">Scan the clinic&apos;s QR code</Text>
          {error ? (
            <Text className="rounded-lg bg-black/60 px-3 py-2 text-center text-sm text-white">
              {error}
            </Text>
          ) : (
            <Text className="text-sm text-white/80">
              Point your camera at the code at the front desk
            </Text>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}
