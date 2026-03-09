/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#000';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    tint: tintColorLight,
    icon: 'rgba(0, 0, 0, 0.6)',
    tabIconDefault: 'rgba(0, 0, 0, 0.6)',
    tabIconSelected: tintColorLight,
    card: '#ffffff',
    border: 'rgba(0, 0, 0, 0.18)',
    subtitle: 'rgba(0, 0, 0, 0.6)',
    grid: 'rgba(0, 0, 0, 0.08)',
    backgroundTransparent: 'rgba(255, 255, 255, 0)',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    tint: tintColorDark,
    icon: 'rgba(255, 255, 255, 0.7)',
    tabIconDefault: 'rgba(255, 255, 255, 0.7)',
    tabIconSelected: tintColorDark,
    card: '#000000',
    border: 'rgba(255, 255, 255, 0.24)',
    subtitle: 'rgba(255, 255, 255, 0.7)',
    grid: 'rgba(255, 255, 255, 0.16)',
    backgroundTransparent: 'rgba(0, 0, 0, 0)',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
