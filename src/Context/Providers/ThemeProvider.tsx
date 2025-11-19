import {DefaultTheme} from '@react-navigation/native';
import {PropsWithChildren, useCallback, useMemo} from 'react';
import {useColorScheme} from 'react-native';
import {adaptNavigationTheme} from 'react-native-paper';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {ThemeContext} from '#src/Context/Contexts/ThemeContext';
import {twitarrTheme, twitarrThemeDark} from '#src/Styles/Theme';

// https://callstack.github.io/react-native-paper/docs/guides/theming
const {LightTheme: navLightTheme, DarkTheme: navDarkTheme} = adaptNavigationTheme({
  reactNavigationLight: DefaultTheme,
  reactNavigationDark: DefaultTheme,
});

/**
 * This provider is used to provide the theme to the app.
 *
 * Configures the theme based on the app config and the device color scheme.
 *
 * Intentionally does not expose light and dark themes separately. Use the one
 * theme property provided.
 */
export const ThemeProvider = ({children}: PropsWithChildren) => {
  const colorScheme = useColorScheme();
  const {appConfig} = useConfig();

  const isDarkMode = useCallback(() => {
    if (appConfig.accessibility.useSystemTheme) {
      return colorScheme === 'dark';
    }
    return appConfig.accessibility.darkMode;
  }, [appConfig.accessibility.darkMode, appConfig.accessibility.useSystemTheme, colorScheme]);

  const theme = useMemo(() => {
    return isDarkMode() ? twitarrThemeDark : twitarrTheme;
  }, [isDarkMode]);

  const navTheme = useMemo(() => {
    return isDarkMode() ? navDarkTheme : navLightTheme;
  }, [isDarkMode]);

  return <ThemeContext.Provider value={{isDarkMode: isDarkMode(), theme, navTheme}}>{children}</ThemeContext.Provider>;
};
