import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AuthFormShell } from '@/components/auth/auth-form-shell';
import { AuthInput } from '@/components/auth/auth-input';
import { Button } from '@/components/Button';
import { ThemedText } from '@/components/ThemedText';
import { ForestCampTheme, forestCampTypography, spacing } from '@/constants/ForestCampTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { authClient } from '@/services/auth-client';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const handleSubmit = async () => {
    const trimmedToken = token.trim();

    if (!trimmedToken) {
      setError(t('auth.resetTokenRequired'));
      return;
    }

    if (newPassword.length < 8) {
      setError(t('auth.passwordTooShort'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await authClient.resetPassword({
      newPassword,
      token: trimmedToken,
      fetchOptions: {
        throw: false,
      },
    });

    setIsSubmitting(false);

    if (result.error) {
      setError(result.error.message ?? t('auth.resetPasswordError'));
      return;
    }

    setResetDone(true);
  };

  return (
    <AuthFormShell
      title={t('auth.resetPasswordTitle')}
      description={t('auth.resetPasswordDescription')}
      switchHref="./sign-in"
      switchPrompt={t('auth.resetPasswordPrompt')}
      switchLabel={t('auth.resetPasswordBack')}
    >
      {resetDone ? (
        <>
          <View style={styles.successBox}>
            <ThemedText style={styles.successText}>{t('auth.resetPasswordSuccess')}</ThemedText>
          </View>

          <Button
            title={t('auth.goToSignIn')}
            onPress={() => router.replace('./sign-in')}
            style={styles.button}
          />
        </>
      ) : (
        <>
          <AuthInput
            label={t('auth.resetTokenLabel')}
            value={token}
            onChangeText={setToken}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="one-time-code"
            textContentType="oneTimeCode"
            placeholder={t('auth.resetTokenPlaceholder')}
          />

          <AuthInput
            label={t('auth.newPasswordLabel')}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="new-password"
            textContentType="newPassword"
            placeholder={t('auth.newPasswordPlaceholder')}
          />

          <AuthInput
            label={t('auth.confirmNewPasswordLabel')}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="new-password"
            textContentType="password"
            placeholder={t('auth.confirmNewPasswordPlaceholder')}
          />

          {error ? (
            <View style={styles.errorBox}>
              <ThemedText selectable style={styles.errorText}>
                {error}
              </ThemedText>
            </View>
          ) : null}

          <Button
            title={isSubmitting ? t('auth.resettingPassword') : t('auth.resetPasswordCta')}
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
