import {NavigationContainer} from '@react-navigation/native';
import React, {PropsWithChildren, useCallback} from 'react';
import {PaperProvider} from 'react-native-paper';

import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {closeAllMenus} from '#src/Hooks/useMenu';
import {navigationLinking} from '#src/Libraries/Linking';

export const NavigationProvider = ({children}: PropsWithChildren) => {
  const {navTheme, theme} = useAppTheme();

  /**
   * Callback to close all menus when navigation state changes at the root level.
   * This catches deep linking navigation that might not trigger nested navigator listeners.
   */
  const handleStateChange = useCallback(() => closeAllMenus(), []);

  return (
    <NavigationContainer linking={navigationLinking} theme={navTheme} onStateChange={handleStateChange}>
      <PaperProvider theme={theme}>{children}</PaperProvider>
    </NavigationContainer>
  );
};
