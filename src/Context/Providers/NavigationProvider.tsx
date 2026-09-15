import {useBackHandler} from '@react-native-community/hooks';
import {NavigationContainer} from '@react-navigation/native';
import React, {PropsWithChildren, ReactElement, useCallback} from 'react';
import {PaperProvider} from 'react-native-paper';
import {HeaderButtonsProvider} from 'react-navigation-header-buttons/HeaderButtonsProvider';

import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {closeAllMenus} from '#src/Hooks/useMenu';
import {navigationLinking} from '#src/Libraries/Linking';
import {navigationRef} from '#src/Libraries/NavigationRef';

export const NavigationProvider = ({children}: PropsWithChildren) => {
  const {navTheme, theme} = useAppTheme();

  /**
   * Callback to close all menus when navigation state changes at the root level.
   * This catches deep linking navigation that might not trigger nested navigator listeners.
   */
  const handleStateChange = useCallback(() => closeAllMenus(), []);

  /**
   * Consume Android Back at the true root so React Native does not finish the activity.
   * Nested screens still pop via React Navigation when canGoBack() is true.
   *
   * 20260827: I am worried this may be bit overzealous.
   */
  const handleRootBackPress = useCallback(() => {
    if (!navigationRef.isReady()) {
      return true;
    }
    if (navigationRef.canGoBack()) {
      return false;
    }
    return true;
  }, []);

  useBackHandler(handleRootBackPress);

  return (
    <NavigationContainer
      ref={navigationRef}
      linking={navigationLinking}
      theme={navTheme}
      onStateChange={handleStateChange}>
      <PaperProvider theme={theme}>
        <HeaderButtonsProvider stackType={'native'}>{children as ReactElement}</HeaderButtonsProvider>
      </PaperProvider>
    </NavigationContainer>
  );
};
