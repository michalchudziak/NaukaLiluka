import {
  Image,
  type ImageSourcePropType,
  StyleSheet,
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

type GuideCardProps = {
  image: ImageSourcePropType;
  title: string;
  body: string;
};

export function GuideCard({ image, title, body }: GuideCardProps) {
  const { width } = useWindowDimensions();
  const metrics = getForestCampMetrics(width);
  const imageSize = Math.min(width * 0.35, 160);

  return (
    <View style={[styles.card, { maxWidth: metrics.maxContentWidth }]}>
      <View style={styles.row}>
        <Image
          source={image}
          style={[styles.image, { width: imageSize, height: imageSize }]}
          resizeMode="cover"
        />
        <View style={styles.textWrap}>
          <ThemedText style={styles.title}>{title}</ThemedText>
          <ThemedText style={styles.body}>{body}</ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: ForestCampTheme.radius.xl,
    borderWidth: 2,
    borderColor: ForestCampTheme.colors.border,
    backgroundColor: ForestCampTheme.colors.card,
    padding: spacing.lg,
    alignSelf: 'center',
    ...forestCampSoftShadow,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.lg,
    alignItems: 'center',
  },
  image: {
    borderRadius: ForestCampTheme.radius.md,
  },
  textWrap: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    ...forestCampTypography.heading,
    fontSize: 17,
    lineHeight: 22,
    color: ForestCampTheme.colors.title,
  },
  body: {
    ...forestCampTypography.body,
    fontSize: 14,
    lineHeight: 20,
    color: ForestCampTheme.colors.textMuted,
  },
});
