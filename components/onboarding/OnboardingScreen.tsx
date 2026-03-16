import { useCallback, useState } from 'react';
import { Image, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OnboardingButtons } from '@/components/onboarding/OnboardingButtons';
import { OnboardingDots } from '@/components/onboarding/OnboardingDots';
import { ThemedText } from '@/components/ThemedText';
import { ForestCampTheme, forestCampTypography } from '@/constants/ForestCampTheme';
import { onboardingSteps } from '@/content/onboarding';
import { useTranslation } from '@/hooks/useTranslation';

const SWIPE_THRESHOLD = 50;

interface OnboardingScreenProps {
  onComplete: () => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const { t } = useTranslation();
  const { width, height } = useWindowDimensions();
  const [stepIndex, setStepIndex] = useState(0);
  const translateX = useSharedValue(0);
  const dragX = useSharedValue(0);

  const isLastStep = stepIndex === onboardingSteps.length - 1;
  const imageSize = Math.min(width - 64, height * 0.45);
  const lastIndex = onboardingSteps.length - 1;

  const goToStep = useCallback(
    (index: number) => {
      setStepIndex(index);
      translateX.value = withTiming(-index * width, { duration: 350 });
    },
    [width, translateX]
  );

  const handleNext = useCallback(() => {
    if (isLastStep) {
      onComplete();
    } else {
      goToStep(stepIndex + 1);
    }
  }, [isLastStep, onComplete, goToStep, stepIndex]);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .onUpdate((e) => {
      dragX.value = e.translationX;
      translateX.value = -stepIndex * width + e.translationX;
    })
    .onEnd((e) => {
      dragX.value = 0;
      if (e.translationX < -SWIPE_THRESHOLD && stepIndex < lastIndex) {
        runOnJS(goToStep)(stepIndex + 1);
      } else if (e.translationX > SWIPE_THRESHOLD && stepIndex > 0) {
        runOnJS(goToStep)(stepIndex - 1);
      } else {
        translateX.value = withTiming(-stepIndex * width, { duration: 250 });
      }
    });

  const carouselStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <GestureDetector gesture={panGesture}>
          <View style={styles.carouselWrapper}>
            <Animated.View
              style={[styles.carousel, { width: width * onboardingSteps.length }, carouselStyle]}
            >
              {onboardingSteps.map((step) => (
                <View key={step.key} style={[styles.slide, { width }]}>
                  <Image
                    source={step.image}
                    style={{ width: imageSize, height: imageSize, borderRadius: 24 }}
                    resizeMode="cover"
                  />
                </View>
              ))}
            </Animated.View>
          </View>
        </GestureDetector>

        <View style={styles.content}>
          <View style={styles.textBlock}>
            <ThemedText style={styles.title}>
              {t(`onboarding.${onboardingSteps[stepIndex].key}.title`)}
            </ThemedText>
            <ThemedText style={styles.description}>
              {t(`onboarding.${onboardingSteps[stepIndex].key}.description`)}
            </ThemedText>
          </View>

          <OnboardingDots count={onboardingSteps.length} activeIndex={stepIndex} />

          <OnboardingButtons isLastStep={isLastStep} onNext={handleNext} onSkip={onComplete} />
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ForestCampTheme.colors.background,
  },
  carouselWrapper: {
    flex: 1,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  carousel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 32,
    paddingBottom: 24,
    gap: 24,
  },
  textBlock: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    ...forestCampTypography.display,
    fontSize: 28,
    lineHeight: 36,
    color: ForestCampTheme.colors.title,
    textAlign: 'center',
  },
  description: {
    ...forestCampTypography.body,
    fontSize: 17,
    lineHeight: 24,
    color: ForestCampTheme.colors.textMuted,
    textAlign: 'center',
  },
});
