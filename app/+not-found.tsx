import { router } from 'expo-router';

import { StatusScreen } from '@/components/status/status-screen';

// Figma node 1123:31899 ("404 Error"). `+not-found` is expo-router's
// convention for a screen shown on any unmatched route.
export default function NotFoundScreen() {
  return (
    <StatusScreen
      icon="search"
      title="404 Error"
      description="Sorry, the page you are looking for doesn't exist or has been moved."
      actions={[
        {
          label: 'Go back',
          variant: 'secondary',
          icon: 'arrow-left',
          onPress: () => router.back(),
        },
        {
          label: 'Take me home',
          onPress: () => router.replace('/'),
        },
      ]}
    />
  );
}
