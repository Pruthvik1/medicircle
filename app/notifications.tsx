import { Feather } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconBadge } from '@/components/app/ui';
import { LogoLoader } from '@/components/brand/logo-loader';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/context/auth-context';
import { useMarkRead, useNotifications } from '@/features/notifications/api';

const KIND_ICON = {
  appointment_request: 'calendar',
  appointment_decision: 'check-circle',
  prescription: 'file-text',
} as const;

function timeAgo(iso: string) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} h ago`;
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
}

export default function NotificationsScreen() {
  const { user } = useAuth();
  const { data, isLoading, refetch, isRefetching } = useNotifications(user?.id);
  const markRead = useMarkRead(user?.id ?? '');

  if (!user) return <Redirect href="/login" />;

  const unreadIds = (data ?? []).filter((n) => !n.read).map((n) => n.id);

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
        <Text className="flex-1 text-lg font-semibold text-foreground">Notifications</Text>
        {unreadIds.length > 0 ? (
          <Pressable
            onPress={() => markRead.mutate(unreadIds)}
            hitSlop={8}
            accessibilityRole="button"
          >
            <Text className="text-sm font-medium text-link">Mark all read</Text>
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />
        }
      >
        {isLoading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <LogoLoader size={48} />
          </View>
        ) : !data || data.length === 0 ? (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              padding: 32,
              gap: 8,
            }}
          >
            <Text className="text-base font-semibold text-foreground">
              You&apos;re all caught up
            </Text>
            <Text className="text-center text-sm text-muted-foreground">
              Booking updates and prescriptions will appear here.
            </Text>
          </View>
        ) : (
          data.map((n) => (
            <Pressable
              key={n.id}
              onPress={() => (n.read ? undefined : markRead.mutate([n.id]))}
              accessibilityRole="button"
              className={
                n.read
                  ? 'flex-row gap-3 border-b border-border px-4 py-4'
                  : 'flex-row gap-3 border-b border-border bg-primary-soft px-4 py-4'
              }
            >
              <IconBadge name={KIND_ICON[n.kind as keyof typeof KIND_ICON] ?? 'bell'} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text className="text-sm font-semibold text-foreground">{n.title}</Text>
                {n.body ? <Text className="text-sm text-muted-foreground">{n.body}</Text> : null}
                <Text className="text-xs text-placeholder">{timeAgo(n.createdAt)}</Text>
              </View>
              {!n.read ? <View className="mt-1.5 h-2 w-2 rounded-full bg-primary" /> : null}
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
