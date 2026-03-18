import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { ForestCampTheme, spacing } from '@/constants/ForestCampTheme';

interface OnboardingDotsProps {
  count: number;
  activeIndex: number;
}

export function OnboardingDots({ count, activeIndex }: OnboardingDotsProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }, (_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: fixed-count dots never reorder
        <Dot key={i} active={i === activeIndex} />
      ))}
    </View>
  );
}

function Dot({ active }: { active: boolean }) {
  const animatedStyle = useAnimatedStyle(() => ({
    width: withTiming(active ? 24 : 8, { duration: 300 }),
    backgroundColor: withTiming(
      active ? ForestCampTheme.colors.primary : ForestCampTheme.colors.border,
      { duration: 300 }
    ),
  }));

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});
