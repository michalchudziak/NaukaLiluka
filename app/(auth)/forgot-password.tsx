import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AuthFormShell } from '@/components/auth/auth-form-shell';
import { AuthInput } from '@/components/auth/auth-input';
import { Button } from '@/components/Button';
import { ThemedText } from '@/components/ThemedText';
import { ForestCampTheme, forestCampTypography, spacing } from '@/constants/ForestCampTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { authClient, isAuthConfigured } from '@/services/auth-client';

function isValidEmail(email: string) {
  return /\S+@\S+\.\S+/.test(email);
}

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  const handleSubmit = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!isAuthConfigured()) {
      setError(t('auth.configurationError'));
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      setError(t('auth.invalidEmail'));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await authClient.requestPasswordReset({
      email: normalizedEmail,
      fetchOptions: {
        throw: false,
      },
    });

    setIsSubmitting(false);

    if (result.error) {
      setError(result.error.message ?? t('auth.forgotPasswordError'));
      return;
    }

    setCodeSent(true);
  };

  return (
    <AuthFormShell
      title={t('auth.forgotPasswordTitle')}
      description={t('auth.forgotPasswordDescription')}
      switchHref="./sign-in"
      switchPrompt={t('auth.forgotPasswordPrompt')}
      switchLabel={t('auth.forgotPasswordBack')}
    >
      {codeSent ? (
        <>
          <View style={styles.successBox}>
            <ThemedText style={styles.successText}>{t('auth.forgotPasswordSuccess')}</ThemedText>
          </View>

          <Button
            title={t('auth.goToResetPassword')}
            onPress={() => router.push('./reset-password')}
            style={styles.button}
          />
        </>
      ) : (
        <>
          <AuthInput
            label={t('auth.emailLabel')}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
            placeholder={t('auth.emailPlaceholder')}
          />

          {error ? (
            <View style={styles.errorBox}>
              <ThemedText selectable style={styles.errorText}>
                {error}
              </ThemedText>
            </View>
          ) : null}

          <Button
            title={isSubmitting ? t('auth.forgotPasswordSending') : t('auth.forgotPasswordCta')}
            onPress={() => void handleSubmit()}
            disabled={isSubmitting}
            style={styles.button}
          />
        </>
      )}
    </AuthFormShell>
  );
}

const styles = StyleSheet.create({
  errorBox: {
    borderRadius: ForestCampTheme.radius.md,
    borderWidth: 1,
    borderColor: '#f0b0a4',
    backgroundColor: '#fff1ed',
    padding: spacing.md,
  },
  errorText: {
    ...forestCampTypography.body,
    fontSize: 14,
    lineHeight: 20,
    color: ForestCampTheme.colors.danger,
    textAlign: 'center',
  },
  successBox: {
    borderRadius: ForestCampTheme.radius.md,
    borderWidth: 1,
    borderColor: '#b8d49f',
    backgroundColor: '#edf6e7',
    padding: spacing.md,
  },
  successText: {
    ...forestCampTypography.body,
    fontSize: 14,
    lineHeight: 20,
    color: ForestCampTheme.colors.primaryStrong,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    flex: 0,
  },
});
