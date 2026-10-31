import { Feather } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';

import { NotificationBell } from './notification-bell';

type IconName = ComponentProps<typeof Feather>['name'];

// `right` replaces the default notification bell (e.g. patient home adds the QR scanner next to it).
export function ScreenHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <View
      style={{
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text className="text-2xl font-bold text-foreground">{title}</Text>
        {subtitle ? <Text className="text-sm text-muted-foreground">{subtitle}</Text> : null}
      </View>
      {right ?? <NotificationBell />}
    </View>
  );
}

export function SectionTitle({ children, action }: { children: string; action?: ReactNode }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Text className="text-base font-semibold text-foreground">{children}</Text>
      {action}
    </View>
  );
}

export function Card({ children, onPress }: { children: ReactNode; onPress?: () => void }) {
  const className = 'rounded-2xl border border-border bg-card p-4';
  return onPress ? (
    <Pressable onPress={onPress} accessibilityRole="button" className={className}>
      {children}
    </Pressable>
  ) : (
    <View className={className}>{children}</View>
  );
}

export function IconBadge({ name }: { name: IconName }) {
  return (
    <View className="h-11 w-11 items-center justify-center rounded-full bg-primary-soft">
      <Feather name={name} size={20} color="#0F8BC0" />
    </View>
  );
}

export function Stat({ label, value, icon }: { label: string; value: string; icon: IconName }) {
  return (
    <View className="flex-1 gap-2 rounded-2xl bg-primary-soft p-4">
      <Feather name={icon} size={18} color="#0F8BC0" />
      <Text className="text-2xl font-bold text-foreground">{value}</Text>
      <Text className="text-xs text-muted-foreground">{label}</Text>
    </View>
  );
}

const STATUS_STYLES = {
  pending: {
    bg: 'bg-reward-soft',
    text: 'text-reward',
    label: 'Pending approval',
  },
  approved: {
    bg: 'bg-success',
    text: 'text-success-foreground',
    label: 'Confirmed',
  },
  completed: {
    bg: 'bg-muted',
    text: 'text-muted-foreground',
    label: 'Completed',
  },
  declined: {
    bg: 'bg-error-surface',
    text: 'text-destructive',
    label: 'Declined',
  },
} as const;

export function StatusPill({ status }: { status: keyof typeof STATUS_STYLES }) {
  const s = STATUS_STYLES[status];
  return (
    <View className={`self-start rounded-full px-2.5 py-1 ${s.bg}`}>
      <Text className={`text-xs font-medium ${s.text}`}>{s.label}</Text>
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  icon,
  variant = 'primary',
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  icon?: IconName;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}) {
  const primary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={{ opacity: disabled ? 0.5 : 1 }}
      className={
        primary
          ? 'flex-row items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3'
          : 'flex-row items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3'
      }
    >
      {icon ? <Feather name={icon} size={16} color={primary ? '#FFFFFF' : '#344054'} /> : null}
      <Text
        className={
          primary
            ? 'text-sm font-semibold text-primary-foreground'
            : 'text-sm font-semibold text-secondary-foreground'
        }
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function Avatar({ name }: { name: string }) {
  const initials = name
    .replace(/^Dr\.?\s+/i, '')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('');
  return (
    <View className="h-11 w-11 items-center justify-center rounded-full bg-primary">
      <Text className="text-sm font-semibold text-primary-foreground">{initials}</Text>
    </View>
  );
}
