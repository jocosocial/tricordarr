import {DefaultTheme, NavigationContainer} from '@react-navigation/native';
import React, {PropsWithChildren, useCallback} from 'react';
import {useColorScheme} from 'react-native';
import {adaptNavigationTheme, PaperProvider} from 'react-native-paper';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {navigationLinking} from '#src/Libraries/Linking';
import {twitarrTheme, twitarrThemeDark} from '#src/Styles/Theme';

// https://callstack.github.io/react-native-paper/docs/guides/theming
const {LightTheme: navLightTheme} = adaptNavigationTheme({reactNavigationLight: DefaultTheme});
const {DarkTheme: navDarkTheme} = adaptNavigationTheme({reactNavigationDark: DefaultTheme});

export const AppNavigationThemeProvider = ({children}: PropsWithChildren) => {
  const colorScheme = useColorScheme();
  const {appConfig} = useConfig();

  const isDarkMode = useCallback(() => {
    if (appConfig.accessibility.useSystemTheme) {
      return colorScheme === 'dark';
    }
    return appConfig.accessibility.darkMode;
  }, [appConfig.accessibility.darkMode, appConfig.accessibility.useSystemTheme, colorScheme]);

  return (
    <NavigationContainer linking={navigationLinking} theme={isDarkMode() ? navDarkTheme : navLightTheme}>
      <PaperProvider theme={isDarkMode() ? twitarrThemeDark : twitarrTheme}>{children}</PaperProvider>
    </NavigationContainer>
  );
};
