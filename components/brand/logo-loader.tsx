import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Rect } from 'react-native-svg';

const BLUE = '#0F8BC0';
const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);

// The medicircle mark as the loading indicator: the open ring travels around
// the cross while the disc and cross stay still. Geometry matches
// assets/brand/medicircle-mark.svg. With Reduce Motion on, the ring holds
// still and the mark just breathes in opacity.
export function LogoLoader({ size = 72, entrance = false }: { size?: number; entrance?: boolean }) {
  const reduceMotion = useReducedMotion();
  const rotation = useSharedValue(0);
  const appear = useSharedValue(entrance ? 0 : 1);
  const breathe = useSharedValue(1);

  useEffect(() => {
    if (entrance) appear.value = withTiming(1, { duration: 600, easing: EASE_OUT });

    if (reduceMotion) {
      breathe.value = withRepeat(
        withSequence(withTiming(0.55, { duration: 900 }), withTiming(1, { duration: 900 })),
        -1
      );
      return;
    }
    // Each lap eases in and out so the ring feels like it's travelling, not spinning on an axis.
    rotation.value = withDelay(
      entrance ? 350 : 0,
      withRepeat(withTiming(360, { duration: 1300, easing: Easing.inOut(Easing.cubic) }), -1)
    );
  }, [entrance, reduceMotion, rotation, appear, breathe]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));
  const markStyle = useAnimatedStyle(() => ({
    opacity: appear.value * breathe.value,
    transform: [{ scale: 0.82 + 0.18 * appear.value }],
  }));

  return (
    <Animated.View
      style={[{ width: size, height: size }, markStyle]}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
    >
      <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">
        <Circle cx={60} cy={60} r={52} fill={BLUE} />
        <Rect x={54} y={42} width={12} height={36} rx={3} fill="#FFFFFF" />
        <Rect x={42} y={54} width={36} height={12} rx={3} fill="#FFFFFF" />
      </Svg>
      <View style={{ position: 'absolute', top: 0, left: 0 }} pointerEvents="none">
        <Animated.View style={ringStyle}>
          <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">
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
          </Svg>
        </Animated.View>
      </View>
    </Animated.View>
  );
}
