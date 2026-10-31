import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Linking, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Tile, ErrorState, Loading, Rating, SectionLabel } from '@/components/patient/patient-ui';
import { hoursSummary } from '@/components/doctor/doctor-profile-view';
import { Text } from '@/components/ui/text';
import { useDoctorProfile } from '@/features/doctor/api';
import { useAwards } from '@/features/doctor/awards-api';

function Fact({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text className="text-xl font-semibold text-foreground">{value}</Text>
      <Text className="text-xs text-muted-foreground">{label}</Text>
    </View>
  );
}

// What a patient sees when they open a doctor from search.
export default function DoctorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading, isError, refetch } = useDoctorProfile(id);
  const awards = useAwards(id);

  const hours = data ? hoursSummary(data.availability) : null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top', 'bottom']}>
      <View className="px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Feather name="arrow-left" size={24} color="#101828" />
        </Pressable>
      </View>

      {isLoading ? (
        <Loading />
      ) : isError || !data ? (
        <ErrorState what="this doctor" onRetry={() => void refetch()} />
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
          <View className="flex-row items-center gap-4">
            <Tile label={data.fullName} tone="solid" />
            <View style={{ flex: 1, gap: 2 }}>
              <Text className="text-2xl font-bold text-foreground">
                Dr. {data.fullName.replace(/^Dr\.?\s+/i, '')}
              </Text>
              <Text className="text-sm text-muted-foreground">{data.specialty}</Text>
              <Rating value={data.ratingAvg} count={data.ratingCount} />
            </View>
          </View>

          <View className="mt-6 flex-row border-y border-border py-4">
            <Fact value={`${data.yearsExperience} yrs`} label="Experience" />
            <Fact value={`₹${data.consultationFee}`} label="Consultation" />
            <Fact value={`${data.ratingCount}`} label="Reviews" />
          </View>

          {data.bio ? (
            <>
              <SectionLabel title="About" />
              <Text className="text-sm leading-5 text-muted-foreground">{data.bio}</Text>
            </>
          ) : null}

          <SectionLabel title="Clinic" />
          <Text className="text-base font-semibold text-foreground">{data.clinic.name}</Text>
          <Text className="mt-1 text-sm text-muted-foreground">{data.clinic.address}</Text>
          {hours ? (
            <Text className="mt-3 text-sm text-foreground">
              {hours.days} · {hours.hours}
            </Text>
          ) : null}

          {awards.data && awards.data.length > 0 ? (
            <>
              <SectionLabel title="Awards" />
              {awards.data.map((a, i) => (
                <View
                  key={a.id}
                  className={`gap-1 py-3 ${i === awards.data.length - 1 ? '' : 'border-b border-border'}`}
                >
                  <View className="flex-row items-center gap-2">
                    <Feather name="award" size={16} color="#B54708" />
                    <Text className="flex-1 text-sm font-semibold text-foreground">
                      {a.title} · {a.year}
                    </Text>
                    {a.verified ? (
                      <View className="flex-row items-center gap-1 rounded-full bg-success px-2 py-0.5">
                        <Feather name="check" size={11} color="#17B26A" />
                        <Text className="text-xs font-medium text-success-foreground">
                          Verified
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  {a.description ? (
                    <Text className="text-sm text-muted-foreground">{a.description}</Text>
                  ) : null}
                  {a.linkUrl ? (
                    <Pressable
                      onPress={() => void Linking.openURL(a.linkUrl)}
                      accessibilityRole="link"
                    >
                      <Text className="text-sm font-medium text-link">View proof</Text>
                    </Pressable>
                  ) : null}
                </View>
              ))}
            </>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
