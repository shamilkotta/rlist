import Svg, { G, Path } from 'react-native-svg';

type AppLogoIconProps = {
  size?: number;
  color: string;
};

export function AppLogoIcon({ size = 32, color }: AppLogoIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 224 224" fill="none">
      <G transform="translate(112 112) scale(1.35) translate(-112 -112) translate(0 6.5)">
        <Path
          fill={color}
          d="M60 78c0-8.8 7.2-16 16-16h24l12 12h36c8.8 0 16 7.2 16 16v8H60v-20zm0 20h104v36c0 8.8-7.2 16-16 16H76c-8.8 0-16-7.2-16-16V98z"
        />
      </G>
    </Svg>
  );
}
