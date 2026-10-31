import { router } from 'expo-router';

import { StatusScreen } from '@/components/status/status-screen';

// Figma node 1125:31982 ("00. No Internet"). Nothing in this app currently
// detects connectivity (no netinfo/expo-network dependency installed) — this
// screen exists as a reachable route with a working "Try Again" retry, wire
// it up to real connectivity detection when that's added.
export default function NoInternetScreen() {
  return (
    <StatusScreen
      icon="wifi-off"
      title="No Internet Connection"
      description="Please check your internet connection and try again to continue using the app."
      actions={[
        {
          label: 'Try Again',
          onPress: () => router.back(),
        },
      ]}
    />
  );
}
