import Svg, { Polygon } from 'react-native-svg';

interface HexagonProps {
  size?: number;
  color?: string;
}

export function Hexagon({ size = 30, color = '#333' }: HexagonProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Polygon points="12,2 20,7 20,17 12,22 4,17 4,7" />
    </Svg>
  );
}
