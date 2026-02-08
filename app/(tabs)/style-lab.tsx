import { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';

type StyleVariantId =
  | 'candy-parade'
  | 'ocean-club'
  | 'forest-camp'
  | 'comic-energy'
  | 'storybook-soft';

type StyleVariant = {
  id: StyleVariantId;
  name: string;
  mood: string;
  description: string;
  background: string;
  accentTop: string;
  accentBottom: string;
  panel: string;
  panelAlt: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryText: string;
  chip: string;
  chipText: string;
};

type PreviewModule = {
  title: string;
  details: string;
  progress: string;
  icon: 'menu-book' | 'calculate' | 'draw';
};

const STYLE_VARIANTS: StyleVariant[] = [
  {
    id: 'candy-parade',
    name: 'Candy Parade',
    mood: 'Wysoka energia',
    description: 'Kontrastowe kolory, grube obrysy i odważne przyciski, które budują efekt gry.',
    background: '#fff7ef',
    accentTop: '#ffd6b5',
    accentBottom: '#ffb4b4',
    panel: '#ffffff',
    panelAlt: '#fff2e8',
    border: '#f2cfb7',
    text: '#2f1f4f',
    textMuted: '#6f6287',
    primary: '#ff6b4a',
    primaryText: '#ffffff',
    chip: '#ffd166',
    chipText: '#403002',
  },
  {
    id: 'ocean-club',
    name: 'Ocean Club',
    mood: 'Spokojna koncentracja',
    description: 'Chłodna paleta i miękkie kształty dla dłuższych sesji bez przebodźcowania.',
    background: '#f0f8ff',
    accentTop: '#b8e0ff',
    accentBottom: '#9fd0f8',
    panel: '#ffffff',
    panelAlt: '#e9f5ff',
    border: '#c2ddee',
    text: '#0f3057',
    textMuted: '#426385',
    primary: '#267ac9',
    primaryText: '#ffffff',
    chip: '#94d2ff',
    chipText: '#0f3057',
  },
  {
    id: 'forest-camp',
    name: 'Forest Camp',
    mood: 'Naturalna przygoda',
    description: 'Ziemiste kolory i wyższy kontrast dla czytelności na zewnątrz i na tablecie.',
    background: '#f4faef',
    accentTop: '#d0efc4',
    accentBottom: '#b6ddb0',
    panel: '#ffffff',
    panelAlt: '#eef8e8',
    border: '#c9e0bf',
    text: '#153f2a',
    textMuted: '#4a6f5c',
    primary: '#2d8a57',
    primaryText: '#ffffff',
    chip: '#b8e986',
    chipText: '#1b3e2a',
  },
  {
    id: 'comic-energy',
    name: 'Comic Energy',
    mood: 'Dynamiczna nauka',
    description: 'Styl plakatu z wyraźnym rytmem i mocnymi sekcjami na szybkie skanowanie.',
    background: '#fff9db',
    accentTop: '#ffe88e',
    accentBottom: '#ffd166',
    panel: '#ffffff',
    panelAlt: '#fff4c2',
    border: '#f2da7a',
    text: '#332252',
    textMuted: '#66518a',
    primary: '#5c2ebc',
    primaryText: '#ffffff',
    chip: '#ffcf4d',
    chipText: '#332252',
  },
  {
    id: 'storybook-soft',
    name: 'Storybook Soft',
    mood: 'Delikatna narracja',
    description: 'Miękkie tony i szerokie odstępy, idealne dla młodszych dzieci i spokojnego tempa.',
    background: '#fffaf5',
    accentTop: '#ffe3d4',
    accentBottom: '#ffd9ef',
    panel: '#ffffff',
    panelAlt: '#fff2f8',
    border: '#f5d5e4',
    text: '#3e2c44',
    textMuted: '#7b5f86',
    primary: '#ff7ca8',
    primaryText: '#ffffff',
    chip: '#ffe4b8',
    chipText: '#573d25',
  },
];

const PREVIEW_MODULES: PreviewModule[] = [
  {
    title: 'Czytanie',
    details: '3 mikro-sesje z dużymi kartami słów i szybką informacją zwrotną.',
    progress: '72%',
    icon: 'menu-book',
  },
  {
    title: 'Matematyka',
    details: 'Równania i liczby z kolorystycznymi podpowiedziami poziomu trudności.',
    progress: '64%',
    icon: 'calculate',
  },
  {
    title: 'Obrazki',
    details: 'Przejrzysta galeria z dużymi celami dotyku i spokojnymi przejściami.',
    progress: '83%',
    icon: 'draw',
  },
];

const PREVIEW_CHIPS = ['Duże cele dotyku', 'Tryb tablet', 'Czytelny kontrast', 'Szybkie skanowanie'];

export default function StyleLabScreen() {
  const { width } = useWindowDimensions();
  const [activeVariant, setActiveVariant] = useState<StyleVariantId>('candy-parade');

  const selectedVariant = useMemo(
    () => STYLE_VARIANTS.find((variant) => variant.id === activeVariant) ?? STYLE_VARIANTS[0],
    [activeVariant]
  );

  const isTablet = width >= 768;
  const hasTwoColumns = width >= 640;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: selectedVariant.background }]}>
      <View style={[styles.accentTop, { backgroundColor: selectedVariant.accentTop }]} />
      <View style={[styles.accentBottom, { backgroundColor: selectedVariant.accentBottom }]} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          isTablet ? styles.contentTablet : styles.contentPhone,
          { paddingBottom: isTablet ? 112 : 92 },
        ]}
      >
        <View style={styles.header}>
          <ThemedText style={[styles.eyebrow, { color: selectedVariant.primary }]}>
            Laboratorium stylu (wersja tymczasowa)
          </ThemedText>
          <ThemedText style={[styles.title, { color: selectedVariant.text }]}>
            Wybierz kierunek wizualny aplikacji dla dzieci
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: selectedVariant.textMuted }]}>
            Testujemy 5 wariantów. Każdy jest projektowany pod tablet i zachowuje czytelność na
            mniejszych ekranach.
          </ThemedText>
        </View>

        <View style={[styles.toggleContainer, { backgroundColor: selectedVariant.panelAlt, borderColor: selectedVariant.border }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.toggleRow}
          >
            {STYLE_VARIANTS.map((variant) => {
              const isActive = variant.id === selectedVariant.id;
              return (
                <Pressable
                  key={variant.id}
                  onPress={() => setActiveVariant(variant.id)}
                  style={({ pressed }) => [
                    styles.toggleButton,
                    {
                      backgroundColor: isActive ? selectedVariant.primary : selectedVariant.panel,
                      borderColor: isActive ? selectedVariant.primary : selectedVariant.border,
                      opacity: pressed ? 0.86 : 1,
                    },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.toggleButtonTitle,
                      { color: isActive ? selectedVariant.primaryText : selectedVariant.text },
                    ]}
                  >
                    {variant.name}
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.toggleButtonSubtitle,
                      {
                        color: isActive ? selectedVariant.primaryText : selectedVariant.textMuted,
                        opacity: isActive ? 0.92 : 1,
                      },
                    ]}
                  >
                    {variant.mood}
                  </ThemedText>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={[styles.heroCard, { backgroundColor: selectedVariant.panel, borderColor: selectedVariant.border }]}>
          <View style={[styles.heroBadge, { backgroundColor: selectedVariant.chip }]}>
            <IconSymbol name="today" size={16} color={selectedVariant.chipText} />
            <ThemedText style={[styles.heroBadgeText, { color: selectedVariant.chipText }]}>
              Aktualny styl: {selectedVariant.name}
            </ThemedText>
          </View>

          <ThemedText style={[styles.heroTitle, { color: selectedVariant.text }]}>
            {selectedVariant.description}
          </ThemedText>

          <View style={styles.heroActions}>
            <View style={[styles.primaryAction, { backgroundColor: selectedVariant.primary }]}>
              <ThemedText style={[styles.primaryActionText, { color: selectedVariant.primaryText }]}>
                Start sesji
              </ThemedText>
            </View>
            <View style={[styles.secondaryAction, { borderColor: selectedVariant.primary }]}>
              <ThemedText style={[styles.secondaryActionText, { color: selectedVariant.text }]}>
                Zobacz demo kart
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.chipRow}>
          {PREVIEW_CHIPS.map((chip) => (
            <View
              key={chip}
              style={[styles.featureChip, { backgroundColor: selectedVariant.panelAlt, borderColor: selectedVariant.border }]}
            >
              <ThemedText style={[styles.featureChipText, { color: selectedVariant.text }]}>
                {chip}
              </ThemedText>
            </View>
          ))}
        </View>

        <View style={styles.moduleGrid}>
          {PREVIEW_MODULES.map((module) => (
            <View
              key={module.title}
              style={[
                styles.moduleCard,
                hasTwoColumns ? styles.moduleCardHalf : styles.moduleCardFull,
                { backgroundColor: selectedVariant.panelAlt, borderColor: selectedVariant.border },
              ]}
            >
              <View style={[styles.moduleIconWrap, { backgroundColor: selectedVariant.chip }]}>
                <IconSymbol name={module.icon} size={20} color={selectedVariant.chipText} />
              </View>
              <ThemedText style={[styles.moduleTitle, { color: selectedVariant.text }]}>
                {module.title}
              </ThemedText>
              <ThemedText style={[styles.moduleDetails, { color: selectedVariant.textMuted }]}>
                {module.details}
              </ThemedText>

              <View style={[styles.progressTrack, { backgroundColor: selectedVariant.panel }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: module.progress,
                      backgroundColor: selectedVariant.primary,
                    },
                  ]}
                />
              </View>

              <ThemedText style={[styles.progressText, { color: selectedVariant.text }]}>
                Gotowość UI: {module.progress}
              </ThemedText>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  accentTop: {
    position: 'absolute',
    top: -80,
    left: -30,
    width: 280,
    height: 220,
    borderRadius: 180,
    opacity: 0.6,
  },
  accentBottom: {
    position: 'absolute',
    right: -70,
    bottom: -120,
    width: 300,
    height: 260,
    borderRadius: 180,
    opacity: 0.58,
  },
  content: {
    width: '100%',
    alignSelf: 'center',
    gap: 16,
  },
  contentPhone: {
    maxWidth: 760,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  contentTablet: {
    maxWidth: 1120,
    paddingHorizontal: 28,
    paddingTop: 24,
  },
  header: {
    gap: 8,
  },
  eyebrow: {
    alignSelf: 'flex-start',
    fontFamily: 'SpaceMono',
    fontSize: 12,
    letterSpacing: 0.25,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 900,
  },
  toggleContainer: {
    borderWidth: 1,
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  toggleRow: {
    gap: 10,
    paddingRight: 10,
  },
  toggleButton: {
    minHeight: 56,
    minWidth: 172,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 2,
  },
  toggleButtonTitle: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
  },
  toggleButtonSubtitle: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  heroCard: {
    borderWidth: 1,
    borderRadius: 28,
    padding: 20,
    gap: 16,
    shadowColor: '#35215a',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 6,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroBadgeText: {
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
  },
  heroTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
  },
  heroActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  primaryAction: {
    minHeight: 52,
    minWidth: 148,
    borderRadius: 16,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryActionText: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '800',
  },
  secondaryAction: {
    minHeight: 52,
    minWidth: 168,
    borderRadius: 16,
    borderWidth: 2,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff85',
  },
  secondaryActionText: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '700',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  featureChip: {
    borderRadius: 14,
    borderWidth: 1,
    minHeight: 44,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  featureChipText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  moduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  moduleCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  moduleCardFull: {
    width: '100%',
  },
  moduleCardHalf: {
    width: '48.7%',
  },
  moduleIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moduleTitle: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
  },
  moduleDetails: {
    fontSize: 14,
    lineHeight: 20,
    minHeight: 58,
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  progressText: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
  },
});
