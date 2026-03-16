import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button } from '@/components/Button';
import { ThemedText } from '@/components/ThemedText';
import { ForestCampTheme, forestCampTypography } from '@/constants/ForestCampTheme';
import { useTranslation } from '@/hooks/useTranslation';

interface OnboardingButtonsProps {
  isLastStep: boolean;
  onNext: () => void;
  onSkip: () => void;
}

export function OnboardingButtons({ isLastStep, onNext, onSkip }: OnboardingButtonsProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Button
        title={isLastStep ? t('onboarding.start') : t('onboarding.next')}
        onPress={onNext}
        style={styles.button}
      />
      <TouchableOpacity
        onPress={onSkip}
        style={[styles.skipButton, isLastStep && styles.skipHidden]}
        disabled={isLastStep}
      >
        <ThemedText style={styles.skipText}>{t('onboarding.skip')}</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 16,
  },
  button: {
    flex: 0,
    width: '100%',
    minHeight: 0,
    maxHeight: undefined,
    padding: 14,
  },
  skipButton: {
    paddingVertical: 8,
  },
  skipHidden: {
    opacity: 0,
  },
  skipText: {
    ...forestCampTypography.body,
    fontSize: 16,
    color: ForestCampTheme.colors.textMuted,
  },
});
