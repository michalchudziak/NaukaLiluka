import { ConvexProvider } from 'convex/react';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Button } from '@/components/Button';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ForestCampTheme, forestCampTypography } from '@/constants/ForestCampTheme';
import { useTranslation } from '@/hooks/useTranslation';
import {
  CloudConfigurationError,
  ConvexService,
  getConvexClient,
  setCloudFailureListener,
} from '@/services/convex';
import { useBookStore } from './book-store';
import { useDrawingsStore } from './drawings-store';
import { useEquationsStore } from './equations-store';
import { useMathStore } from './math-store';
import { useNoRepStore } from './no-rep-store';
import { useSettingsStore } from './settings-store';

type BootstrapStatus = 'loading' | 'ready' | 'error';

function normalizeError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  return new Error('Unknown cloud error.');
}

function LoadingState() {
  const { t } = useTranslation();

  return (
    <ThemedView style={styles.container}>
      <View style={styles.card}>
        <ActivityIndicator size="large" color={ForestCampTheme.colors.primaryStrong} />
        <ThemedText style={styles.title}>{t('cloud.loadingTitle')}</ThemedText>
        <ThemedText style={styles.body}>{t('cloud.loadingDescription')}</ThemedText>
      </View>
    </ThemedView>
  );
}

function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  const { t } = useTranslation();
  const description =
    error instanceof CloudConfigurationError ? t('cloud.configError') : t('cloud.requestError');

  return (
    <ThemedView style={styles.container}>
      <View style={styles.card}>
        <ThemedText style={styles.title}>{t('cloud.errorTitle')}</ThemedText>
        <ThemedText style={styles.body}>{description}</ThemedText>
        <Button title={t('common.retry')} onPress={onRetry} style={styles.button} />
      </View>
    </ThemedView>
  );
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<BootstrapStatus>('loading');
  const [error, setError] = useState<Error | null>(null);

  const bootstrapStores = useCallback(async () => {
    setStatus('loading');
    setError(null);

    try {
      ConvexService.validateConfiguration();
      await useSettingsStore.getState().bootstrap();

      await Promise.all([
        useNoRepStore.getState().bootstrap(),
        useBookStore.getState().bootstrap(),
        useDrawingsStore.getState().bootstrap(),
        useMathStore.getState().bootstrap(),
        useEquationsStore.getState().bootstrap(),
      ]);

      setStatus('ready');
    } catch (error) {
      setError(normalizeError(error));
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    setCloudFailureListener((error) => {
      setError(error);
      setStatus('error');
    });

    void bootstrapStores();

    return () => {
      setCloudFailureListener(null);
    };
  }, [bootstrapStores]);

  if (status === 'loading') {
    return <LoadingState />;
  }

  if (status === 'error' && error) {
    return <ErrorState error={error} onRetry={() => void bootstrapStores()} />;
  }

  return <ConvexProvider client={getConvexClient()}>{children}</ConvexProvider>;
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
  body: {
    ...forestCampTypography.body,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    color: ForestCampTheme.colors.textMuted,
  },
  button: {
    width: '100%',
    flex: 0,
    minHeight: 72,
    maxHeight: 72,
  },
});
