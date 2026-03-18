import { Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthInput } from '@/components/auth/auth-input';
import { ThemedText } from '@/components/ThemedText';
import {
  ForestCampTheme,
  forestCampSoftShadow,
  forestCampTypography,
  getForestCampMetrics,
  spacing,
} from '@/constants/ForestCampTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { authClient } from '@/services/auth-client';
import { ConvexService } from '@/services/convex';
import { resetAllStores } from '@/store/reset-stores';

function formatDateLabel(value: unknown) {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function isValidEmail(email: string) {
  return /\S+@\S+\.\S+/.test(email);
}

function FeedbackMessage({ message, tone }: { message: string | null; tone: 'error' | 'success' }) {
  if (!message) {
    return null;
  }

  return (
    <View style={[styles.feedbackBox, tone === 'error' ? styles.feedbackError : styles.feedbackOk]}>
      <ThemedText
        selectable
        style={tone === 'error' ? styles.feedbackErrorText : styles.feedbackOkText}
      >
        {message}
      </ThemedText>
    </View>
  );
}

function ActionButton({
  label,
  onPress,
  disabled,
  destructive = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  destructive?: boolean;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.82}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.actionButton,
        destructive ? styles.actionButtonDanger : styles.actionButtonPrimary,
        disabled && styles.actionButtonDisabled,
      ]}
    >
      <ThemedText
        style={[
          styles.actionButtonText,
          destructive && styles.actionButtonDangerText,
          disabled && styles.actionButtonTextDisabled,
        ]}
      >
        {label}
      </ThemedText>
    </TouchableOpacity>
  );
}

type AccountProfile = Awaited<ReturnType<typeof ConvexService.getCurrentUser>>;

export default function AccountSettingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const { width } = useWindowDimensions();
  const metrics = getForestCampMetrics(width);
  const { data, isPending, refetch } = authClient.useSession();
  const user = data?.user ?? null;
  const [accountProfile, setAccountProfile] = useState<AccountProfile>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const profileName = user?.name ?? accountProfile?.name ?? '';
  const profileEmail = accountProfile?.email ?? user?.email ?? null;
  const profileCreatedAt = accountProfile?.createdAt ?? user?.createdAt ?? null;
  const memberSince = useMemo(() => formatDateLabel(profileCreatedAt), [profileCreatedAt]);
  const [displayName, setDisplayName] = useState('');
  const [prevProfileName, setPrevProfileName] = useState('');
  if (profileName !== prevProfileName) {
    setPrevProfileName(profileName);
    setDisplayName(profileName);
  }
  const hasProfileChanges = displayName.trim() !== profileName.trim();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const userEmail = user?.email ?? null;

  useEffect(() => {
    let isCancelled = false;

    if (!userEmail) {
      setAccountProfile(null);
      setIsLoadingProfile(false);
      return () => {
        isCancelled = true;
      };
    }

    setIsLoadingProfile(true);

    void (async () => {
      try {
        const profile = await ConvexService.getCurrentUser();

        if (isCancelled) {
          return;
        }

        setAccountProfile(profile);
      } catch {
        if (isCancelled) {
          return;
        }

        setAccountProfile(null);
      } finally {
        if (!isCancelled) {
          setIsLoadingProfile(false);
        }
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [userEmail]);

  const handleSaveProfile = async () => {
    const normalizedName = displayName.trim();

    if (normalizedName.length < 2) {
      setProfileSuccess(null);
      setProfileError(t('auth.nameRequired'));
      return;
    }

    setIsSavingProfile(true);
    setProfileError(null);
    setProfileSuccess(null);

    const result = await authClient.updateUser({
      name: normalizedName,
      fetchOptions: {
        throw: false,
      },
    });

    if (result.error) {
      setIsSavingProfile(false);
      setProfileError(result.error.message ?? t('settings.account.profileSaveError'));
      return;
    }

    try {
      const updatedProfile = await ConvexService.updateCurrentUserProfile({
        name: normalizedName,
      });

      setAccountProfile(updatedProfile);
    } catch {
      setAccountProfile((current) =>
        current
          ? {
              ...current,
              name: normalizedName,
            }
          : current
      );
    }

    await refetch();
    setIsSavingProfile(false);
    setProfileSuccess(t('settings.account.profileSaved'));
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      setPasswordSuccess(null);
      setPasswordError(t('settings.account.currentPasswordRequired'));
      return;
    }

    if (newPassword.length < 8) {
      setPasswordSuccess(null);
      setPasswordError(t('auth.passwordTooShort'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordSuccess(null);
      setPasswordError(t('auth.passwordMismatch'));
      return;
    }

    setIsChangingPassword(true);
    setPasswordError(null);
    setPasswordSuccess(null);

    const result = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
      fetchOptions: {
        throw: false,
      },
    });

    setIsChangingPassword(false);

    if (result.error) {
      setPasswordError(result.error.message ?? t('settings.account.passwordChangeError'));
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordSuccess(t('settings.account.passwordChanged'));
  };

  const handleSignOut = async () => {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);
    setSignOutError(null);

    const result = await authClient.signOut({
      fetchOptions: {
        throw: false,
      },
    });

    setIsSigningOut(false);

    if (result.error) {
      setSignOutError(result.error.message ?? t('auth.signOutError'));
      return;
    }

    resetAllStores();
    router.replace('/sign-in');
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: metrics.screenPadding,
            maxWidth: metrics.maxContentWidth,
            paddingBottom: tabBarHeight + spacing.xl,
          },
        ]}
      >
        <ThemedText style={[styles.pageTitle, metrics.isTablet && styles.pageTitleTablet]}>
          {t('settings.account.title')}
        </ThemedText>
        <ThemedText style={styles.pageDescription}>{t('settings.account.description')}</ThemedText>

        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroBadge}>
              <Ionicons
                name="shield-checkmark-outline"
                size={26}
                color={ForestCampTheme.colors.primaryStrong}
              />
            </View>

            <View style={styles.heroTextBlock}>
              <ThemedText style={styles.heroTitle}>
                {user?.name || t('settings.account.loadingName')}
              </ThemedText>
              <ThemedText selectable style={styles.heroSubtitle}>
                {user?.email || t('auth.loadingDescription')}
              </ThemedText>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaPill}>
              <ThemedText style={styles.metaLabel}>
                {t('settings.account.sessionStatus')}
              </ThemedText>
              <ThemedText style={styles.metaValue}>
                {isPending && !user
                  ? t('settings.account.sessionLoading')
                  : t('settings.account.sessionActive')}
              </ThemedText>
            </View>

            <View style={styles.metaPill}>
              <ThemedText style={styles.metaLabel}>{t('settings.account.memberSince')}</ThemedText>
              <ThemedText style={styles.metaValue}>
                {memberSince ?? t('settings.account.memberSinceUnknown')}
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t('settings.account.profileTitle')}</ThemedText>
          <ThemedText style={styles.sectionDescription}>
            {t('settings.account.profileDescription')}
          </ThemedText>

          <View style={styles.card}>
            <View style={styles.readonlyRow}>
              <ThemedText style={styles.readonlyLabel}>
                {t('settings.account.emailLabel')}
              </ThemedText>
              <ThemedText selectable style={styles.readonlyValue}>
                {profileEmail && isValidEmail(profileEmail) ? profileEmail : '...'}
              </ThemedText>
              <ThemedText style={styles.helperText}>
                {t('settings.account.emailReadonlyHint')}
              </ThemedText>
            </View>

            <View style={styles.separator} />

            <AuthInput
              label={t('auth.nameLabel')}
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="words"
              autoCorrect={false}
              autoComplete="name"
              textContentType="name"
              editable={!isSavingProfile}
              placeholder={t('auth.namePlaceholder')}
            />

            <FeedbackMessage message={profileError} tone="error" />
            <FeedbackMessage message={profileSuccess} tone="success" />

            <ActionButton
              label={
                isSavingProfile
                  ? t('settings.account.profileSaving')
                  : t('settings.account.saveProfile')
              }
              onPress={() => void handleSaveProfile()}
              disabled={isSavingProfile || isLoadingProfile || !user || !hasProfileChanges}
            />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t('settings.account.passwordTitle')}</ThemedText>
          <ThemedText style={styles.sectionDescription}>
            {t('settings.account.passwordDescription')}
          </ThemedText>

          <View style={styles.card}>
            <AuthInput
              label={t('settings.account.currentPasswordLabel')}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="password"
              textContentType="password"
              editable={!isChangingPassword}
              placeholder={t('auth.passwordPlaceholder')}
            />

            <AuthInput
              label={t('settings.account.newPasswordLabel')}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="new-password"
              textContentType="newPassword"
              editable={!isChangingPassword}
              placeholder={t('auth.passwordPlaceholder')}
            />

            <AuthInput
              label={t('settings.account.confirmNewPasswordLabel')}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="new-password"
              textContentType="newPassword"
              editable={!isChangingPassword}
              placeholder={t('auth.confirmPasswordPlaceholder')}
            />

            <ThemedText style={styles.helperText}>{t('settings.account.passwordHint')}</ThemedText>

            <FeedbackMessage message={passwordError} tone="error" />
            <FeedbackMessage message={passwordSuccess} tone="success" />

            <ActionButton
              label={
                isChangingPassword
                  ? t('settings.account.passwordChanging')
                  : t('settings.account.changePassword')
              }
              onPress={() => void handleChangePassword()}
              disabled={isChangingPassword || !user}
            />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t('settings.account.sessionTitle')}</ThemedText>
          <ThemedText style={styles.sectionDescription}>
            {t('settings.account.sessionDescription')}
          </ThemedText>

          <View style={styles.card}>
            <View style={styles.sessionRow}>
              <Ionicons
                name="phone-portrait-outline"
                size={20}
                color={ForestCampTheme.colors.primaryStrong}
              />
              <ThemedText style={styles.sessionBody}>
                {t('settings.account.autoRestore')}
              </ThemedText>
            </View>

            <FeedbackMessage message={signOutError} tone="error" />

            <ActionButton
              label={isSigningOut ? t('auth.signingOut') : t('settings.account.signOut')}
              onPress={() => void handleSignOut()}
              disabled={isSigningOut}
              destructive
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ForestCampTheme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    width: '100%',
    alignSelf: 'center',
    paddingTop: spacing.md,
    gap: spacing.xl,
  },
  pageTitle: {
    ...forestCampTypography.display,
    fontSize: 30,
    lineHeight: 34,
    color: ForestCampTheme.colors.title,
  },
  pageTitleTablet: {
    fontSize: 38,
    lineHeight: 42,
  },
  pageDescription: {
    ...forestCampTypography.body,
    fontSize: 15,
    lineHeight: 22,
    color: ForestCampTheme.colors.textMuted,
  },
  heroCard: {
    backgroundColor: ForestCampTheme.colors.card,
    borderWidth: 2,
    borderColor: ForestCampTheme.colors.borderStrong,
    borderRadius: ForestCampTheme.radius.xl,
    padding: spacing.xl,
    gap: spacing.lg,
    ...forestCampSoftShadow,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  heroBadge: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e1efcf',
  },
  heroTextBlock: {
    flex: 1,
    gap: spacing.xs,
  },
  heroTitle: {
    ...forestCampTypography.heading,
    fontSize: 22,
    lineHeight: 26,
    color: ForestCampTheme.colors.title,
  },
  heroSubtitle: {
    ...forestCampTypography.body,
    fontSize: 14,
    lineHeight: 20,
    color: ForestCampTheme.colors.textMuted,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  metaPill: {
    flexGrow: 1,
    minWidth: 140,
    borderRadius: ForestCampTheme.radius.md,
    borderWidth: 1,
    borderColor: ForestCampTheme.colors.border,
    backgroundColor: ForestCampTheme.colors.cardMuted,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.xxs,
  },
  metaLabel: {
    ...forestCampTypography.body,
    fontSize: 12,
    lineHeight: 16,
    color: ForestCampTheme.colors.textMuted,
  },
  metaValue: {
    ...forestCampTypography.heading,
    fontSize: 15,
    lineHeight: 20,
    color: ForestCampTheme.colors.title,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    ...forestCampTypography.heading,
    fontSize: 15,
    lineHeight: 18,
    color: ForestCampTheme.colors.textMuted,
    marginLeft: spacing.md,
  },
  sectionDescription: {
    ...forestCampTypography.body,
    fontSize: 14,
    lineHeight: 20,
    color: ForestCampTheme.colors.textMuted,
    marginHorizontal: spacing.md,
  },
  card: {
    backgroundColor: ForestCampTheme.colors.card,
    borderWidth: 2,
    borderColor: ForestCampTheme.colors.border,
    borderRadius: ForestCampTheme.radius.lg,
    padding: spacing.lg,
    gap: spacing.lg,
    ...forestCampSoftShadow,
  },
  readonlyRow: {
    gap: spacing.sm,
  },
  readonlyLabel: {
    ...forestCampTypography.heading,
    fontSize: 14,
    lineHeight: 18,
    color: ForestCampTheme.colors.textMuted,
  },
  readonlyValue: {
    ...forestCampTypography.body,
    fontSize: 16,
    lineHeight: 22,
    color: ForestCampTheme.colors.title,
  },
  separator: {
    height: 1,
    backgroundColor: ForestCampTheme.colors.border,
  },
  helperText: {
    ...forestCampTypography.body,
    fontSize: 13,
    lineHeight: 18,
    color: ForestCampTheme.colors.textMuted,
  },
  feedbackBox: {
    borderRadius: ForestCampTheme.radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  feedbackError: {
    backgroundColor: '#fff1ed',
    borderWidth: 1,
    borderColor: '#f0b0a4',
  },
  feedbackOk: {
    backgroundColor: '#edf6e7',
    borderWidth: 1,
    borderColor: '#b8d49f',
  },
  feedbackErrorText: {
    ...forestCampTypography.body,
    fontSize: 13,
    lineHeight: 18,
    color: ForestCampTheme.colors.danger,
  },
  feedbackOkText: {
    ...forestCampTypography.body,
    fontSize: 13,
    lineHeight: 18,
    color: ForestCampTheme.colors.primaryStrong,
  },
  actionButton: {
    minHeight: 56,
    borderRadius: ForestCampTheme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  actionButtonPrimary: {
    backgroundColor: ForestCampTheme.colors.primary,
  },
  actionButtonDanger: {
    backgroundColor: '#f7d7cf',
    borderWidth: 1,
    borderColor: '#e5a798',
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionButtonText: {
    ...forestCampTypography.heading,
    fontSize: 16,
    lineHeight: 20,
    color: '#ffffff',
  },
  actionButtonDangerText: {
    color: ForestCampTheme.colors.danger,
  },
  actionButtonTextDisabled: {
    color: '#eef3e8',
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: ForestCampTheme.radius.md,
    backgroundColor: ForestCampTheme.colors.cardMuted,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  sessionBody: {
    flex: 1,
    ...forestCampTypography.body,
    fontSize: 14,
    lineHeight: 20,
    color: ForestCampTheme.colors.text,
  },
});
