import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';

import { Avatar, Card, PrimaryButton, SectionTitle } from '@/components/app/ui';
import { LogoLoader } from '@/components/brand/logo-loader';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/context/auth-context';
import { useDoctorProfile, type DoctorProfile } from '@/features/doctor/api';
import { useAwards } from '@/features/doctor/awards-api';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

export function hoursSummary(availability: DoctorProfile['availability']) {
  if (availability.length === 0) return null;
  const days = DAY_ORDER.filter((d) => availability.some((a) => a.weekday === d)).map(
    (d) => DAY_NAMES[d]
  );
  const first = availability[0];
  return {
    days: days.join(', '),
    hours: `${first.startTime} – ${first.endTime}`,
    slot: first.slotMinutes,
  };
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text className="text-lg font-semibold text-foreground">{value}</Text>
      <Text className="text-xs text-muted-foreground">{label}</Text>
    </View>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row gap-3">
      <Feather name={icon} size={18} color="#667085" style={{ marginTop: 2 }} />
      <View style={{ flex: 1 }}>
        <Text className="text-xs text-muted-foreground">{label}</Text>
        <Text className="text-sm text-foreground">{value}</Text>
      </View>
    </View>
  );
}

export function DoctorProfileView() {
  const { user, signOut } = useAuth();
  const { data, isLoading, isError, refetch } = useDoctorProfile(user?.id);
  const awards = useAwards(user?.id);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <LogoLoader size={56} />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 32,
          gap: 12,
        }}
      >
        <Text className="text-base font-semibold text-foreground">
          Couldn&apos;t load your profile
        </Text>
        <PrimaryButton label="Try again" icon="refresh-cw" onPress={() => void refetch()} />
      </View>
    );
  }

  const hours = hoursSummary(data.availability);

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 40 }}>
      <View style={{ alignItems: 'center', gap: 8 }}>
        <Avatar name={data.fullName} />
        <Text className="text-xl font-bold text-foreground">
          Dr. {data.fullName.replace(/^Dr\.?\s+/i, '')}
        </Text>
        <Text className="text-sm text-muted-foreground">{data.specialty}</Text>
        <View className="flex-row items-center gap-1">
          <Feather name="star" size={14} color="#B54708" />
          <Text className="text-sm text-foreground">
            {data.ratingCount > 0
              ? `${data.ratingAvg.toFixed(1)} (${data.ratingCount} reviews)`
              : 'No reviews yet'}
          </Text>
        </View>
      </View>

      <Card>
        <View style={{ flexDirection: 'row' }}>
          <Fact label="Experience" value={`${data.yearsExperience} yrs`} />
          <Fact label="Consultation" value={`₹${data.consultationFee}`} />
          <Fact label="Booking" value={data.autoApprove ? 'Auto' : 'Manual'} />
        </View>
      </Card>

      {data.bio ? (
        <View style={{ gap: 8 }}>
          <SectionTitle>About</SectionTitle>
          <Text className="text-sm text-muted-foreground">{data.bio}</Text>
        </View>
      ) : null}

      <View style={{ gap: 12 }}>
        <SectionTitle>Clinic</SectionTitle>
        <Card>
          <View style={{ gap: 14 }}>
            <Row icon="home" label="Clinic" value={data.clinic.name} />
            <Row icon="map-pin" label="Address" value={data.clinic.address} />
            {hours ? (
              <Row
                icon="clock"
                label="Hours"
                value={`${hours.days}\n${hours.hours} · ${hours.slot} min per patient`}
              />
            ) : null}
          </View>
        </Card>
      </View>

      <View style={{ gap: 12 }}>
        <SectionTitle
          action={
            <Pressable
              onPress={() => router.push('/awards')}
              hitSlop={8}
              accessibilityRole="button"
            >
              <Text className="text-sm font-medium text-link">Manage</Text>
            </Pressable>
          }
        >
          Awards
        </SectionTitle>
        <Card>
          {awards.data && awards.data.length > 0 ? (
            <View style={{ gap: 14 }}>
              {awards.data.map((a) => (
                <View key={a.id} className="flex-row items-center gap-3">
                  <Feather name="award" size={18} color="#B54708" />
                  <View style={{ flex: 1 }}>
                    <Text className="text-sm font-medium text-foreground">
                      {a.title} · {a.year}
                    </Text>
                    <Text className="text-xs text-muted-foreground">
                      {a.verified
                        ? 'Verified'
                        : a.linkUrl
                          ? 'Pending verification'
                          : 'No proof link'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-sm text-muted-foreground">
              Add awards with a proof link so patients can trust them.
            </Text>
          )}
        </Card>
      </View>

      <View style={{ gap: 12 }}>
        <SectionTitle>Account</SectionTitle>
        <Card>
          <View style={{ gap: 14 }}>
            <Row icon="award" label="Registration no." value={data.registrationNo} />
            <Row icon="mail" label="Email" value={user?.email ?? ''} />
            <Row icon="phone" label="Phone" value={data.phone || 'Not added'} />
          </View>
        </Card>
      </View>

      <PrimaryButton
        label="Edit profile"
        icon="edit-2"
        onPress={() => router.push('/edit-profile')}
      />
      <Pressable
        onPress={() => void signOut()}
        accessibilityRole="button"
        style={{ alignItems: 'center', padding: 8 }}
      >
        <Text className="text-sm font-medium text-muted-foreground">Sign out</Text>
      </Pressable>
    </ScrollView>
  );
}
