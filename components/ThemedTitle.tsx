import { Text, type TextProps, useWindowDimensions } from 'react-native';
import {
  ForestCampTheme,
  forestCampTypography,
  getForestCampMetrics,
} from '@/constants/ForestCampTheme';

export function ThemedTitle({ style, ...props }: TextProps) {
  const { width } = useWindowDimensions();
  const { isTablet } = getForestCampMetrics(width);

  return (
    <Text
      style={[
        {
          ...forestCampTypography.display,
          fontSize: isTablet ? 28 : 24,
          color: ForestCampTheme.colors.title,
          textAlign: 'center',
        },
        style,
      ]}
      {...props}
    />
  );
}
