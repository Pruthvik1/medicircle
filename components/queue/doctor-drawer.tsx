import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { Text } from '@/components/ui/text';
import type { QueueDoctor } from '@/features/queue/mock';

const COLLAPSED = 96;
const EXPANDED = 520;

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }} accessibilityLabel={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Feather
          key={n}
          name="star"
          size={size}
          color={n <= Math.round(value) ? '#B54708' : '#D0D5DD'}
        />
      ))}
    </View>
  );
}

// Bottom drawer on the queue screen: collapsed it peeks with the doctor's
// rating, expanded it shows rewards, the rating breakdown and recent reviews.
export function DoctorDrawer({ doctor }: { doctor: QueueDoctor }) {
  const [open, setOpen] = useState(false);

  const sheetStyle = useAnimatedStyle(() => ({
    height: withTiming(open ? EXPANDED : COLLAPSED, { duration: 260 }),
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#FFFFFF',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          borderWidth: 1,
          borderBottomWidth: 0,
          borderColor: '#EAECF0',
          shadowColor: '#101828',
          shadowOpacity: 0.12,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: -4 },
          elevation: 12,
          overflow: 'hidden',
        },
        sheetStyle,
      ]}
    >
      <Pressable
        onPress={() => setOpen((v) => !v)}
        accessibilityRole="button"
        accessibilityLabel={open ? 'Collapse doctor details' : 'Expand doctor details'}
        style={{ height: COLLAPSED, paddingHorizontal: 20, paddingTop: 8 }}
      >
        <View
          style={{
            alignSelf: 'center',
            width: 40,
            height: 4,
            borderRadius: 2,
            backgroundColor: '#D0D5DD',
          }}
        />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            marginTop: 12,
          }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: '#E7F4FA',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Feather name="user" size={22} color="#0F8BC0" />
          </View>
          <View style={{ flex: 1 }}>
            <Text className="text-base font-semibold text-foreground">{doctor.name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Stars value={doctor.ratingAvg} />
              <Text className="text-xs text-muted-foreground">
                {doctor.ratingAvg.toFixed(1)} ({doctor.ratingCount})
              </Text>
            </View>
          </View>
          <Feather name={open ? 'chevron-down' : 'chevron-up'} size={22} color="#475467" />
        </View>
      </Pressable>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 32,
          gap: 20,
        }}
      >
        <View>
          <Text className="text-sm text-muted-foreground">
            {doctor.specialty} · {doctor.yearsExperience} yrs experience
          </Text>
          <Text className="text-sm text-muted-foreground">{doctor.clinic}</Text>
        </View>

        {doctor.rewards.length > 0 ? (
          <View style={{ gap: 8 }}>
            <Text className="text-sm font-semibold text-foreground">Rewards</Text>
            {doctor.rewards.map((reward) => (
              <View
                key={reward.id}
                className="flex-row items-center gap-3 rounded-xl bg-reward-soft p-3"
              >
                <Feather name="award" size={22} color="#B54708" />
                <View style={{ flex: 1 }}>
                  <Text className="text-sm font-semibold text-reward">{reward.title}</Text>
                  <Text className="text-xs text-muted-foreground">{reward.description}</Text>
                </View>
                <Text className="text-xs text-muted-foreground">{reward.year}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={{ gap: 8 }}>
          <Text className="text-sm font-semibold text-foreground">Ratings</Text>
          {([5, 4, 3, 2, 1] as const).map((star) => {
            const count = doctor.ratingBreakdown[star];
            return (
              <View key={star} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text className="w-3 text-xs text-muted-foreground">{star}</Text>
                <View
                  style={{
                    flex: 1,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: '#F2F4F7',
                  }}
                >
                  <View
                    style={{
                      width: `${(count / doctor.ratingCount) * 100}%`,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: '#0F8BC0',
                    }}
                  />
                </View>
                <Text className="w-8 text-right text-xs text-muted-foreground">{count}</Text>
              </View>
            );
          })}
        </View>

        <View style={{ gap: 12 }}>
          <Text className="text-sm font-semibold text-foreground">Recent reviews</Text>
          {doctor.reviews.map((review) => (
            <View key={review.id} style={{ gap: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text className="text-sm font-medium text-foreground">{review.author}</Text>
                <Stars value={review.rating} size={12} />
              </View>
              <Text className="text-sm text-muted-foreground">{review.comment}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </Animated.View>
  );
}
