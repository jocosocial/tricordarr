// Generated from #063953 at
// https://callstack.github.io/react-native-paper/docs/guides/theming#creating-dynamic-theme-colors
// with a couple of added values from the Swiftarr UI.
import {configureFonts, DefaultTheme, useTheme} from 'react-native-paper';

// Primary color is the blue-ish element we use for everything.
export const twitarrPrimaryColor = '#063953';
// Error color for things that have gone wrong.
export const twitarrErrorColor = '#BA1A1A';
// Note color, for notes. Based on sticky notes.
export const twitarrNoteColor = 'rgb(254, 255, 156)';

/**
 * This may need some additional love and care. I don't enjoy that we are
 * using the "default" for everything, but I also don't want to go override a bajillion
 * different properties because React-Native-Paper stock styling bothers me.
 * https://callstack.github.io/react-native-paper/docs/guides/fonts/#variable-fonts
 */
const fontConfig = {
  default: {
    fontSize: 16,
    fontFamily: 'FontFamily',
    fontWeight: undefined,
    letterSpacing: 0,
    lineHeight: 20,
  },
};

export const twitarrTheme = {
  ...DefaultTheme,
  fonts: configureFonts({config: fontConfig}),
  colors: {
    primary: 'rgb(0, 101, 145)',
    onPrimary: 'rgb(255, 255, 255)',
    primaryContainer: 'rgb(201, 230, 255)',
    onPrimaryContainer: 'rgb(0, 30, 47)',
    secondary: 'rgb(79, 96, 110)',
    onSecondary: 'rgb(255, 255, 255)',
    secondaryContainer: 'rgb(211, 229, 245)',
    onSecondaryContainer: 'rgb(12, 29, 41)',
    tertiary: 'rgb(100, 89, 124)',
    onTertiary: 'rgb(255, 255, 255)',
    tertiaryContainer: 'rgb(234, 221, 255)',
    onTertiaryContainer: 'rgb(31, 22, 53)',
    error: 'rgb(186, 26, 26)',
    onError: 'rgb(255, 255, 255)',
    errorContainer: 'rgb(255, 218, 214)',
    onErrorContainer: 'rgb(65, 0, 2)',
    background: 'rgb(252, 252, 255)',
    onBackground: 'rgb(25, 28, 30)',
    surface: 'rgb(252, 252, 255)',
    onSurface: 'rgb(25, 28, 30)',
    surfaceVariant: 'rgb(221, 227, 234)',
    onSurfaceVariant: 'rgb(65, 71, 77)',
    outline: 'rgb(113, 120, 126)',
    outlineVariant: 'rgb(193, 199, 206)',
    shadow: 'rgb(0, 0, 0)',
    scrim: 'rgb(0, 0, 0)',
    inverseSurface: 'rgb(46, 49, 51)',
    inverseOnSurface: 'rgb(240, 240, 243)',
    inversePrimary: 'rgb(137, 206, 255)',
    elevation: {
      level0: 'transparent',
      level1: 'rgb(239, 244, 250)',
      level2: 'rgb(232, 240, 246)',
      level3: 'rgb(224, 235, 243)',
      level4: 'rgb(222, 234, 242)',
      level5: 'rgb(217, 231, 240)',
    },
    surfaceDisabled: 'rgba(25, 28, 30, 0.12)',
    onSurfaceDisabled: 'rgba(25, 28, 30, 0.38)',
    backdrop: 'rgba(43, 49, 55, 0.7)', // Alpha from 0.4
    twitarrNeutralButton: 'rgb(13, 110, 253)',
    twitarrPositiveButton: 'rgb(25, 135, 84)',
    twitarrNegativeButton: 'rgb(220, 53, 69)',
  },
};

export const twitarrThemeDark = {
  ...DefaultTheme,
  fonts: configureFonts({config: fontConfig}),
  colors: {
    primary: 'rgb(137, 206, 255)',
    onPrimary: 'rgb(0, 52, 77)',
    primaryContainer: 'rgb(0, 76, 110)',
    onPrimaryContainer: 'rgb(201, 230, 255)',
    secondary: 'rgb(183, 201, 217)',
    onSecondary: 'rgb(33, 50, 63)',
    secondaryContainer: 'rgb(56, 73, 86)',
    onSecondaryContainer: 'rgb(211, 229, 245)',
    tertiary: 'rgb(206, 192, 232)',
    onTertiary: 'rgb(53, 43, 75)',
    tertiaryContainer: 'rgb(76, 65, 99)',
    onTertiaryContainer: 'rgb(234, 221, 255)',
    error: 'rgb(255, 180, 171)',
    onError: 'rgb(105, 0, 5)',
    errorContainer: 'rgb(147, 0, 10)',
    onErrorContainer: 'rgb(255, 180, 171)',
    background: 'rgb(25, 28, 30)',
    onBackground: 'rgb(226, 226, 229)',
    surface: 'rgb(25, 28, 30)',
    onSurface: 'rgb(226, 226, 229)',
    surfaceVariant: 'rgb(65, 71, 77)',
    onSurfaceVariant: 'rgb(193, 199, 206)',
    outline: 'rgb(139, 145, 152)',
    outlineVariant: 'rgb(65, 71, 77)',
    shadow: 'rgb(0, 0, 0)',
    scrim: 'rgb(0, 0, 0)',
    inverseSurface: 'rgb(226, 226, 229)',
    inverseOnSurface: 'rgb(46, 49, 51)',
    inversePrimary: 'rgb(0, 101, 145)',
    elevation: {
      level0: 'transparent',
      level1: 'rgb(31, 37, 41)',
      level2: 'rgb(34, 42, 48)',
      level3: 'rgb(37, 48, 55)',
      level4: 'rgb(38, 49, 57)',
      level5: 'rgb(41, 53, 62)',
    },
    surfaceDisabled: 'rgba(226, 226, 229, 0.12)',
    onSurfaceDisabled: 'rgba(226, 226, 229, 0.38)',
    backdrop: 'rgba(43, 49, 55, 0.7)', // Alpha from 0.4
    twitarrNeutralButton: 'rgb(13, 110, 253)',
    twitarrPositiveButton: 'rgb(25, 135, 84)',
    twitarrNegativeButton: 'rgb(220, 53, 69)',
  },
};

// https://callstack.github.io/react-native-paper/docs/guides/theming/#typescript
export type AppThemeType = typeof twitarrTheme;
export const useAppTheme = () => useTheme<AppThemeType>();
