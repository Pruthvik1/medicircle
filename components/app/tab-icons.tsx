import type { ColorValue } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

// Tab bar icons drawn for medicircle: one 24px grid, 1.75 stroke, round caps.
// Inactive = outline. Active = the same shape with a soft brand-tint fill, so
// the selected tab reads from shape as well as colour. The calendar and
// records icons carry the mark's cross so the set shares the logo's DNA.

type IconProps = { color: ColorValue; size?: number; active?: boolean };
const TINT = 'rgba(15,139,192,0.16)';
const STROKE = 1.75;

const Base = ({ size = 24, children }: { size?: number; children: React.ReactNode }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {children}
  </Svg>
);

const line = {
  strokeWidth: STROKE,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

export function HomeTabIcon({ color, size, active }: IconProps) {
  return (
    <Base size={size}>
      <Path
        d="M4 10.6 12 4l8 6.6V19a1.5 1.5 0 0 1-1.5 1.5h-3.2a.8.8 0 0 1-.8-.8v-4.2a1.5 1.5 0 0 0-1.5-1.5h-2a1.5 1.5 0 0 0-1.5 1.5v4.2a.8.8 0 0 1-.8.8H5.5A1.5 1.5 0 0 1 4 19v-8.4Z"
        fill={active ? TINT : 'none'}
        stroke={color}
        {...line}
      />
    </Base>
  );
}

export function CalendarTabIcon({ color, size, active }: IconProps) {
  return (
    <Base size={size}>
      <Rect
        x={3.5}
        y={5}
        width={17}
        height={15.5}
        rx={3.5}
        fill={active ? TINT : 'none'}
        stroke={color}
        {...line}
      />
      <Path d="M8 3v4M16 3v4M3.5 10h17" stroke={color} {...line} />
      <Path d="M12 12.6v4.6M9.7 14.9h4.6" stroke={color} {...line} />
    </Base>
  );
}

export function RecordsTabIcon({ color, size, active }: IconProps) {
  return (
    <Base size={size}>
      <Path
        d="M6.5 3.5h7.2L19 8.8V19a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19V5a1.5 1.5 0 0 1 1.5-1.5Z"
        fill={active ? TINT : 'none'}
        stroke={color}
        {...line}
      />
      <Path d="M13.5 3.8V9H19" stroke={color} {...line} />
      <Path d="M8.5 14h2l1.2-2.4 1.8 4.4 1-2h1.5" stroke={color} {...line} />
    </Base>
  );
}

export function PeopleTabIcon({ color, size, active }: IconProps) {
  return (
    <Base size={size}>
      <Circle cx={9.5} cy={8.5} r={3.5} fill={active ? TINT : 'none'} stroke={color} {...line} />
      <Path d="M3.5 19.5c.4-3 2.8-5 6-5s5.6 2 6 5" stroke={color} {...line} />
      <Path
        d="M15.5 5.4a3.2 3.2 0 0 1 0 6.2M17.5 14.8c1.8.7 2.8 2.3 3 4.7"
        stroke={color}
        {...line}
      />
    </Base>
  );
}

export function ProfileTabIcon({ color, size, active }: IconProps) {
  return (
    <Base size={size}>
      <Circle cx={12} cy={8.5} r={3.8} fill={active ? TINT : 'none'} stroke={color} {...line} />
      <Path
        d="M4.5 20c.5-3.6 3.4-5.8 7.5-5.8s7 2.2 7.5 5.8"
        fill={active ? TINT : 'none'}
        stroke={color}
        {...line}
      />
    </Base>
  );
}

export function BellIcon({ color, size, active }: IconProps) {
  return (
    <Base size={size}>
      <Path
        d="M6 16.5V11a6 6 0 1 1 12 0v5.5l1.4 1.8a.6.6 0 0 1-.5 1H5.1a.6.6 0 0 1-.5-1L6 16.5Z"
        fill={active ? TINT : 'none'}
        stroke={color}
        {...line}
      />
      <Path d="M10 21a2.2 2.2 0 0 0 4 0" stroke={color} {...line} />
    </Base>
  );
}
