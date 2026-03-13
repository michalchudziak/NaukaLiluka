import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ForestCampTheme, forestCampTypography } from '@/constants/ForestCampTheme';

export function AuthStatusScreen({ title, description }: { title: string; description: string }) {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.card}>
        <ActivityIndicator size="large" color={ForestCampTheme.colors.primaryStrong} />
        <ThemedText style={styles.title}>{title}</ThemedText>
        <ThemedText style={styles.description}>{description}</ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: ForestCampTheme.colors.background,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: ForestCampTheme.radius.xl,
    borderWidth: 2,
    borderColor: ForestCampTheme.colors.border,
    backgroundColor: ForestCampTheme.colors.card,
    padding: 24,
    alignItems: 'center',
    gap: 16,
  },
  title: {
    ...forestCampTypography.heading,
    fontSize: 24,
    lineHeight: 30,
    textAlign: 'center',
    color: ForestCampTheme.colors.title,
  },
  description: {
    ...forestCampTypography.body,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    color: ForestCampTheme.colors.textMuted,
  },
});
