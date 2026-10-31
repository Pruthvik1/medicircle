import { Feather } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { PrimaryButton } from '@/components/app/ui';
import { LogoLoader } from '@/components/brand/logo-loader';
import { Text } from '@/components/ui/text';

export function Centered({ children }: { children: ReactNode }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12, flex: 1 }}>
      {children}
    </View>
  );
}

export function Loading() {
  return (
    <Centered>
      <LogoLoader size={48} />
    </Centered>
  );
}

export function ErrorState({ what, onRetry }: { what: string; onRetry: () => void }) {
  return (
    <Centered>
      <Text className="text-base font-semibold text-foreground">Couldn&apos;t load {what}</Text>
      <PrimaryButton label="Try again" icon="refresh-cw" onPress={onRetry} />
    </Centered>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: { label: string; onPress: () => void };
}) {
  return (
    <Centered>
      <Text className="text-base font-semibold text-foreground">{title}</Text>
      <Text className="text-center text-sm text-muted-foreground">{body}</Text>
      {action ? <PrimaryButton label={action.label} onPress={action.onPress} /> : null}
    </Centered>
  );
}

// A list is rows divided by hairlines, not a stack of cards.
export function Row({
  onPress,
  children,
  last,
}: {
  onPress?: () => void;
  children: ReactNode;
  last?: boolean;
}) {
  const className = `flex-row items-center gap-3 py-3.5 ${last ? '' : 'border-b border-border'}`;
  return onPress ? (
    <Pressable onPress={onPress} accessibilityRole="button" className={className}>
      {children}
    </Pressable>
  ) : (
    <View className={className}>{children}</View>
  );
}

export function Tile({ label, tone = 'brand' }: { label: string; tone?: 'brand' | 'solid' }) {
  const initials = label
    .replace(/^Dr\.?\s+/i, '')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <View
      className={
        tone === 'solid'
          ? 'h-12 w-12 items-center justify-center rounded-full bg-primary'
          : 'h-12 w-12 items-center justify-center rounded-xl bg-primary-soft'
      }
    >
      <Text
        className={
          tone === 'solid'
            ? 'text-sm font-semibold text-primary-foreground'
            : 'text-sm font-semibold text-primary'
        }
      >
        {initials}
      </Text>
    </View>
  );
}

export function Rating({ value, count }: { value: number; count?: number }) {
  if (!count) return <Text className="text-xs text-muted-foreground">New</Text>;
  return (
    <View className="flex-row items-center gap-1">
      <Feather name="star" size={13} color="#B54708" />
      <Text className="text-sm font-medium text-foreground">{value.toFixed(1)}</Text>
    </View>
  );
}

export function SectionLabel({ title, hint }: { title: string; hint?: string }) {
  return (
    <View className="flex-row items-baseline justify-between pb-1 pt-6">
      <Text className="text-lg font-semibold text-foreground">{title}</Text>
      {hint ? <Text className="text-xs text-muted-foreground">{hint}</Text> : null}
    </View>
  );
}
