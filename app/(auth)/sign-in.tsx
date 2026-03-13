import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AuthFormShell } from '@/components/auth/auth-form-shell';
import { AuthInput } from '@/components/auth/auth-input';
import { Button } from '@/components/Button';
import { ThemedText } from '@/components/ThemedText';
import { ForestCampTheme, forestCampTypography } from '@/constants/ForestCampTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { authClient, isAuthConfigured } from '@/services/auth-client';

function isValidEmail(email: string) {
  return /\S+@\S+\.\S+/.test(email);
}

export default function SignInScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    if (!password) {
      setError(t('auth.passwordRequired'));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await authClient.signIn.email({
      email: normalizedEmail,
      password,
      fetchOptions: {
        throw: false,
      },
    });

    setIsSubmitting(false);

    if (result.error) {
      setError(result.error.message ?? t('auth.signInError'));
      return;
    }

    router.replace('/my-day');
  };

  return (
    <AuthFormShell
      title={t('auth.signInTitle')}
      description={t('auth.signInDescription')}
      switchHref="./sign-up"
      switchPrompt={t('auth.noAccount')}
      switchLabel={t('auth.goToSignUp')}
    >
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

      <AuthInput
        label={t('auth.passwordLabel')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="password"
        textContentType="password"
        placeholder={t('auth.passwordPlaceholder')}
      />

      {error ? (
        <View style={styles.errorBox}>
          <ThemedText selectable style={styles.errorText}>
            {error}
          </ThemedText>
        </View>
      ) : null}

      <Button
        title={isSubmitting ? t('auth.signingIn') : t('auth.signInCta')}
        onPress={() => void handleSubmit()}
        disabled={isSubmitting}
        style={styles.button}
      />
    </AuthFormShell>
  );
}

const styles = StyleSheet.create({
  errorBox: {
    borderRadius: ForestCampTheme.radius.md,
    borderWidth: 1,
    borderColor: '#f0b0a4',
    backgroundColor: '#fff1ed',
    padding: 12,
  },
  errorText: {
    ...forestCampTypography.body,
    fontSize: 14,
    lineHeight: 20,
    color: ForestCampTheme.colors.danger,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    flex: 0,
  },
});
