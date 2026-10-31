import { Text, View } from 'react-native';
import Svg, { Circle, Rect } from 'react-native-svg';

type MedicircleLogoProps = {
  size?: 'sm' | 'lg';
};

// Mirrors assets/brand/medicircle-logo.svg. The mark is drawn with
// react-native-svg and the wordmark is a native Text so it uses the app font.
const DIMENSIONS = {
  sm: { mark: 48, font: 30 }, // login screen
  lg: { mark: 72, font: 44 }, // splash screen
};

const NAVY = '#101828';
const BLUE = '#0F8BC0';

export function MedicircleLogo({ size = 'sm' }: MedicircleLogoProps) {
  const { mark, font } = DIMENSIONS[size];

  return (
    <View
      style={{ flexDirection: 'row', alignItems: 'center', gap: mark * 0.2 }}
      accessibilityRole="image"
      accessibilityLabel="medicircle logo"
    >
      <Svg width={mark} height={mark} viewBox="0 0 120 120" fill="none">
        <Circle cx={60} cy={60} r={52} fill={BLUE} />
        <Circle
          cx={60}
          cy={60}
          r={40}
          stroke="#FFFFFF"
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray="222 29"
          transform="rotate(-60 60 60)"
        />
        <Rect x={54} y={42} width={12} height={36} rx={3} fill="#FFFFFF" />
        <Rect x={42} y={54} width={36} height={12} rx={3} fill="#FFFFFF" />
      </Svg>
      <Text style={{ fontSize: font, fontWeight: '700', color: NAVY }}>
        medi<Text style={{ color: BLUE }}>circle</Text>
      </Text>
    </View>
  );
}
