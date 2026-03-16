import type { ImageSourcePropType } from 'react-native';

export interface OnboardingStep {
  key: string;
  image: ImageSourcePropType;
}

export const onboardingSteps: OnboardingStep[] = [
  {
    key: 'step1',
    image: require('@/assets/images/onboarding/step1.png'),
  },
  {
    key: 'step2',
    image: require('@/assets/images/onboarding/step2.png'),
  },
  {
    key: 'step3',
    image: require('@/assets/images/onboarding/step3.png'),
  },
  {
    key: 'step4',
    image: require('@/assets/images/onboarding/step4.png'),
  },
];
