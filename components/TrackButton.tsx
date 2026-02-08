import { ForestCampTheme } from '@/constants/ForestCampTheme';
import { Button } from './Button';

interface TrackButtonProps {
  title: string;
  isCompleted?: boolean;
  onPress?: () => void;
}

export function TrackButton({ title, isCompleted = false, onPress }: TrackButtonProps) {
  const buttonColor = isCompleted ? ForestCampTheme.colors.success : ForestCampTheme.colors.primary;
  const buttonBorderColor = isCompleted
    ? ForestCampTheme.colors.borderStrong
    : ForestCampTheme.colors.primaryStrong;

  return (
    <Button
      title={`${title} ${isCompleted ? '✅' : '⏳'}`}
      onPress={onPress}
      style={{
        backgroundColor: buttonColor,
        borderColor: buttonBorderColor,
      }}
    />
  );
}
