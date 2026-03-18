import { StyleSheet, Switch, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ForestCampTheme, forestCampTypography, spacing } from '@/constants/ForestCampTheme';

interface SwitchSettingProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export function SwitchSetting({ label, description, value, onValueChange }: SwitchSettingProps) {
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <ThemedText style={styles.label}>{label}</ThemedText>
        {description && <ThemedText style={styles.description}>{description}</ThemedText>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#d3e2c5', true: ForestCampTheme.colors.success }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: ForestCampTheme.colors.card,
  },
  textContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  label: {
    ...forestCampTypography.heading,
    fontSize: 16,
    color: ForestCampTheme.colors.title,
  },
  description: {
    ...forestCampTypography.body,
    fontSize: 13,
    color: ForestCampTheme.colors.textMuted,
    marginTop: spacing.xs,
    lineHeight: 18,
  },
});
