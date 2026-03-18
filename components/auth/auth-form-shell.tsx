import { Link } from 'expo-router';
import {
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import {
  ForestCampTheme,
  forestCampSoftShadow,
  forestCampTypography,
  getForestCampMetrics,
  spacing,
} from '@/constants/ForestCampTheme';

export function AuthFormShell({
  title,
  description,
  children,
  switchHref,
  switchPrompt,
  switchLabel,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  switchHref: './sign-in' | './sign-up';
  switchPrompt: string;
  switchLabel: string;
}) {
  const { width } = useWindowDimensions();
  const metrics = getForestCampMetrics(width);

  return (
    <KeyboardAvoidingView
      style={styles.keyboard}
      behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: metrics.screenPadding,
            paddingVertical: metrics.isTablet ? spacing['4xl'] : spacing['2xl'],
          },
        ]}
      >
        <View style={[styles.card, metrics.isTablet && styles.cardTablet]}>
          <View style={styles.header}>
            <ThemedText style={[styles.title, metrics.isTablet && styles.titleTablet]}>
              {title}
            </ThemedText>
            <ThemedText style={styles.description}>{description}</ThemedText>
          </View>

          <View style={styles.form}>{children}</View>

          <View style={styles.footer}>
            <ThemedText style={styles.footerText}>{switchPrompt}</ThemedText>
            <Link href={switchHref} asChild>
              <TouchableOpacity activeOpacity={0.8}>
                <ThemedText style={styles.footerLink}>{switchLabel}</ThemedText>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
    backgroundColor: ForestCampTheme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    gap: spacing['2xl'],
    borderRadius: ForestCampTheme.radius.xl,
    borderWidth: 2,
    borderColor: ForestCampTheme.colors.border,
    backgroundColor: ForestCampTheme.colors.card,
    padding: spacing['2xl'],
    ...forestCampSoftShadow,
  },
  cardTablet: {
    padding: spacing['3xl'],
  },
  header: {
    gap: spacing.md,
  },
  title: {
    ...forestCampTypography.display,
    fontSize: 32,
    lineHeight: 36,
    color: ForestCampTheme.colors.title,
    textAlign: 'center',
  },
  titleTablet: {
    fontSize: 40,
    lineHeight: 44,
  },
  description: {
    ...forestCampTypography.body,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    color: ForestCampTheme.colors.textMuted,
  },
  form: {
    gap: spacing.lg,
  },
  footer: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  footerText: {
    ...forestCampTypography.body,
    fontSize: 15,
    lineHeight: 20,
    color: ForestCampTheme.colors.textMuted,
    textAlign: 'center',
  },
  footerLink: {
    ...forestCampTypography.heading,
    fontSize: 16,
    lineHeight: 20,
    color: ForestCampTheme.colors.primaryStrong,
  },
});
