import { Feather } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';

type Action = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  icon?: ComponentProps<typeof Feather>['name'];
};

// Shared shell for the app's full-screen status states — 404 (1123:31899)
// and No Internet (1125:31982) both use this exact icon/title/body/actions
// layout, just with different copy and actions.
export function StatusScreen({
  icon,
  title,
  description,
  actions,
}: {
  icon: ComponentProps<typeof Feather>['name'];
  title: string;
  description: string;
  actions: Action[];
}) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top', 'bottom']}>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 16,
        }}
      >
        <View style={{ width: 250, alignItems: 'center', gap: 16 }}>
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 9999,
              backgroundColor: '#E7F4FA',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Feather name={icon} size={32} color="#0F8BC0" />
          </View>

          <View style={{ alignItems: 'center', gap: 4 }}>
            <Text className="text-lg font-semibold text-foreground">{title}</Text>
            <Text className="text-center text-xs text-muted-foreground">{description}</Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            {actions.map((action) => (
              <Pressable
                key={action.label}
                onPress={action.onPress}
                className={
                  action.variant === 'secondary'
                    ? 'flex-row items-center gap-1 rounded-xl border border-border bg-background px-3 py-2 shadow-sm'
                    : 'flex-row items-center gap-1 rounded-xl bg-primary px-3 py-2 shadow-sm'
                }
              >
                {action.icon ? (
                  <Feather
                    name={action.icon}
                    size={16}
                    color={action.variant === 'secondary' ? 'rgb(52 64 84)' : 'white'}
                  />
                ) : null}
                <Text
                  className={
                    action.variant === 'secondary'
                      ? 'text-sm font-medium text-secondary-foreground'
                      : 'text-sm font-medium text-primary-foreground'
                  }
                >
                  {action.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
