import {DefaultTheme, NavigationContainer} from '@react-navigation/native';
import React, {PropsWithChildren, useCallback} from 'react';
import {useColorScheme} from 'react-native';
import {adaptNavigationTheme, PaperProvider} from 'react-native-paper';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {closeAllMenus} from '#src/Hooks/MenuHook';
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

  const handleStateChange = useCallback(() => {
    // Close all menus when navigation state changes at the root level
    // This catches deep linking navigation that might not trigger nested navigator listeners
    closeAllMenus();
  }, []);

  return (
    <NavigationContainer
      linking={navigationLinking}
      theme={isDarkMode() ? navDarkTheme : navLightTheme}
      onStateChange={handleStateChange}>
      <PaperProvider theme={isDarkMode() ? twitarrThemeDark : twitarrTheme}>{children}</PaperProvider>
    </NavigationContainer>
  );
};
