import { Colors } from '@/constants/Colors';
import { Button } from './Button';

interface TrackButtonProps {
  title: string;
  isCompleted?: boolean;
  onPress?: () => void;
}

export function TrackButton({ title, isCompleted = false, onPress }: TrackButtonProps) {
  const buttonColor = isCompleted ? '#9CA3AF' : Colors.light.tint;

  return (
    <Button
      title={`${title} ${isCompleted ? '✅' : '⏳'}`}
      onPress={onPress}
      style={{ backgroundColor: buttonColor }}
    />
  );
}
