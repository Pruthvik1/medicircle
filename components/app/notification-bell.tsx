import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { useAuth } from '@/context/auth-context';
import { useUnreadCount } from '@/features/notifications/api';

import { BellIcon } from './tab-icons';

export function NotificationBell() {
  const { user } = useAuth();
  const unread = useUnreadCount(user?.id);

  return (
    <Pressable
      onPress={() => router.push('/notifications')}
      accessibilityRole="button"
      accessibilityLabel={unread ? `Notifications, ${unread} unread` : 'Notifications'}
      hitSlop={8}
      className="h-11 w-11 items-center justify-center rounded-full border border-border bg-background"
    >
      <BellIcon color="#344054" size={22} />
      {unread > 0 ? (
        <View className="absolute -right-0.5 -top-0.5 min-w-5 items-center rounded-full border-2 border-white bg-destructive px-1">
          <Text className="text-[10px] font-bold text-white">{unread > 9 ? '9+' : unread}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}
