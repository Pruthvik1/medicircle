import { Feather } from '@expo/vector-icons';
import { Redirect, router, Tabs } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  CalendarTabIcon,
  HomeTabIcon,
  PeopleTabIcon,
  ProfileTabIcon,
  RecordsTabIcon,
} from '@/components/app/tab-icons';
import { SplashScreen } from '@/components/brand/splash-screen';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/context/auth-context';
import { useNewRequestListener, usePendingCount } from '@/features/doctor/requests-api';
import { useNotificationsRealtime } from '@/features/notifications/api';

// Tab labels differ per role; the screens behind them switch on role too.
const LABELS = {
  patient: {
    home: 'Home',
    appointments: 'Appointments',
    records: 'Records',
    profile: 'Profile',
  },
  clinic: {
    home: 'Dashboard',
    appointments: 'Requests',
    records: 'Patients',
    profile: 'Profile',
  },
} as const;

type TabIcon = (props: {
  color: import('react-native').ColorValue;
  size?: number;
  active?: boolean;
}) => React.JSX.Element;

const ICONS: Record<string, { patient: TabIcon; clinic: TabIcon }> = {
  home: { patient: HomeTabIcon, clinic: HomeTabIcon },
  appointments: { patient: CalendarTabIcon, clinic: CalendarTabIcon },
  records: { patient: RecordsTabIcon, clinic: PeopleTabIcon },
  profile: { patient: ProfileTabIcon, clinic: ProfileTabIcon },
};

export default function AppLayout() {
  const { isHydrating, user } = useAuth();
  const isDoctor = user?.role === 'doctor' && !user.needsOnboarding;
  const doctorId = isDoctor ? user?.id : undefined;
  const pending = usePendingCount(doctorId);
  const [toast, setToast] = useState(false);

  // Realtime: a patient just booked. Show a banner and let the badge refresh.
  const onNewRequest = useCallback(() => {
    setToast(true);
    setTimeout(() => setToast(false), 6000);
  }, []);
  useNewRequestListener(doctorId, onNewRequest);
  useNotificationsRealtime(user?.id);

  // Splash (Figma node 424:26410) while the stored session is restored.
  if (isHydrating) return <SplashScreen />;

  if (!user) return <Redirect href="/login" />;
  if (user.needsOnboarding) return <Redirect href="/onboarding" />;

  const labels = user.role === 'patient' ? LABELS.patient : LABELS.clinic;

  return (
    <>
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: '#0F8BC0',
          tabBarInactiveTintColor: '#667085',
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
          tabBarStyle: { height: 64, paddingTop: 6, borderTopColor: '#EAECF0' },
          tabBarIcon: ({ color, focused }) => {
            const Icon = ICONS[route.name]?.[user.role === 'patient' ? 'patient' : 'clinic'];
            return Icon ? <Icon color={color} size={26} active={focused} /> : null;
          },
        })}
      >
        {(Object.keys(labels) as (keyof typeof labels)[]).map((name) => (
          <Tabs.Screen
            key={name}
            name={name}
            options={{
              title: labels[name],
              tabBarBadge:
                name === 'appointments' && isDoctor && pending.data ? pending.data : undefined,
            }}
          />
        ))}
      </Tabs>
      {toast ? (
        <SafeAreaView
          edges={['top']}
          style={{ position: 'absolute', top: 0, left: 0, right: 0 }}
          pointerEvents="box-none"
        >
          <Pressable
            onPress={() => {
              setToast(false);
              router.navigate('/appointments');
            }}
            accessibilityRole="alert"
            className="mx-4 mt-2 flex-row items-center gap-3 rounded-2xl bg-primary p-4 shadow-lg"
          >
            <Feather name="bell" size={20} color="#FFFFFF" />
            <Text className="flex-1 text-sm font-semibold text-primary-foreground">
              New appointment request — tap to review
            </Text>
          </Pressable>
        </SafeAreaView>
      ) : null}
    </>
  );
}
