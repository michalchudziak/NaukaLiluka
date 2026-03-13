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

export default function SignUpScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!isAuthConfigured()) {
      setError(t('auth.configurationError'));
      return;
    }

    if (normalizedName.length < 2) {
      setError(t('auth.nameRequired'));
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      setError(t('auth.invalidEmail'));
      return;
    }

    if (password.length < 8) {
      setError(t('auth.passwordTooShort'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await authClient.signUp.email({
      name: normalizedName,
      email: normalizedEmail,
      password,
      fetchOptions: {
        throw: false,
      },
    });

    setIsSubmitting(false);

    if (result.error) {
      setError(result.error.message ?? t('auth.signUpError'));
      return;
    }

    router.replace('/my-day');
  };

  return (
    <AuthFormShell
      title={t('auth.signUpTitle')}
      description={t('auth.signUpDescription')}
      switchHref="./sign-in"
      switchPrompt={t('auth.haveAccount')}
      switchLabel={t('auth.goToSignIn')}
    >
      <AuthInput
        label={t('auth.nameLabel')}
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        autoCorrect={false}
        autoComplete="name"
        textContentType="name"
        placeholder={t('auth.namePlaceholder')}
      />

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
        autoComplete="new-password"
        textContentType="newPassword"
        placeholder={t('auth.passwordPlaceholder')}
      />

      <AuthInput
        label={t('auth.confirmPasswordLabel')}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="new-password"
        textContentType="password"
        placeholder={t('auth.confirmPasswordPlaceholder')}
      />

      {error ? (
        <View style={styles.errorBox}>
          <ThemedText selectable style={styles.errorText}>
            {error}
          </ThemedText>
        </View>
      ) : null}

      <Button
        title={isSubmitting ? t('auth.signingUp') : t('auth.signUpCta')}
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
