import React, {PropsWithChildren, useCallback} from 'react';
import {navigationLinking} from '../../../libraries/Linking.ts';
import {twitarrTheme, twitarrThemeDark} from '../../../styles/Theme.ts';
import {DefaultTheme, NavigationContainer} from '@react-navigation/native';
import {adaptNavigationTheme, PaperProvider} from 'react-native-paper';
import {useColorScheme} from 'react-native';
import {useConfig} from '../Contexts/ConfigContext.ts';

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
