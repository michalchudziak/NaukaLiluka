import { StyleSheet, TextInput, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ForestCampTheme, forestCampTypography, spacing } from '@/constants/ForestCampTheme';

export function AuthInput({
  label,
  error,
  ...props
}: React.ComponentProps<typeof TextInput> & {
  label: string;
  error?: string | null;
}) {
  return (
    <View style={styles.wrapper}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <TextInput
        {...props}
        placeholderTextColor={ForestCampTheme.colors.textMuted}
        style={[styles.input, error ? styles.inputError : undefined]}
      />
      {error ? (
        <ThemedText selectable style={styles.errorText}>
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm,
  },
  label: {
    ...forestCampTypography.heading,
    fontSize: 16,
    lineHeight: 20,
    color: ForestCampTheme.colors.title,
  },
  input: {
    minHeight: 54,
    borderRadius: ForestCampTheme.radius.md,
    borderWidth: 2,
    borderColor: ForestCampTheme.colors.border,
    backgroundColor: ForestCampTheme.colors.cardMuted,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: ForestCampTheme.colors.text,
    ...forestCampTypography.body,
    fontSize: 16,
    lineHeight: 20,
  },
  inputError: {
    borderColor: ForestCampTheme.colors.danger,
  },
  errorText: {
    ...forestCampTypography.body,
    fontSize: 13,
    lineHeight: 18,
    color: ForestCampTheme.colors.danger,
  },
});
