import { Pressable, StyleSheet, View } from 'react-native';
import { ForestCampTheme, forestCampTypography } from '@/constants/ForestCampTheme';
import { ThemedText } from './ThemedText';

interface StateActionRowProps {
  title: string;
  subtitle: string;
  isCompleted?: boolean;
  onPress: () => void;
}

export function StateActionRow({
  title,
  subtitle,
  isCompleted = false,
  onPress,
}: StateActionRowProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        isCompleted && styles.rowDone,
        pressed && styles.rowPressed,
      ]}
      onPress={onPress}
    >
      <View style={[styles.dot, isCompleted ? styles.dotCompleted : styles.dotPending]} />
      <View style={styles.textWrap}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
      </View>
      <ThemedText style={styles.arrow}>{isCompleted ? '✓' : '→'}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 64,
    borderRadius: ForestCampTheme.radius.md,
    borderWidth: 1,
    borderColor: ForestCampTheme.colors.border,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowDone: {
    backgroundColor: '#f3f9ec',
  },
  rowPressed: {
    opacity: 0.75,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 999,
  },
  dotPending: {
    backgroundColor: ForestCampTheme.colors.warning,
  },
  dotCompleted: {
    backgroundColor: ForestCampTheme.colors.success,
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...forestCampTypography.heading,
    fontSize: 17,
    lineHeight: 20,
    color: ForestCampTheme.colors.title,
  },
  subtitle: {
    ...forestCampTypography.body,
    fontSize: 13,
    lineHeight: 16,
    color: ForestCampTheme.colors.textMuted,
  },
  arrow: {
    ...forestCampTypography.heading,
    fontSize: 20,
    lineHeight: 20,
    color: ForestCampTheme.colors.primaryStrong,
  },
});
