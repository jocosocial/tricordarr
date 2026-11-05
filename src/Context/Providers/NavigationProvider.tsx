import {useBackHandler} from '@react-native-community/hooks';
import {LinkingOptions, NavigationContainer} from '@react-navigation/native';
import React, {PropsWithChildren, ReactElement, useCallback, useMemo} from 'react';
import {PaperProvider} from 'react-native-paper';
import {HeaderButtonsProvider} from 'react-navigation-header-buttons/HeaderButtonsProvider';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useOobe} from '#src/Context/Contexts/OobeContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {closeAllMenus} from '#src/Hooks/useMenu';
import {useServerUrl} from '#src/Hooks/useServerUrl';
import {navigationLinking} from '#src/Libraries/Linking';
import {createLogger} from '#src/Libraries/Logger';
import {navigationRef} from '#src/Libraries/NavigationRef';
import {shouldRouteIncomingLink} from '#src/Libraries/UrlParser';
import {RootStackParamList} from '#src/Navigation/Stacks/Root/RootStackComponents';

const logger = createLogger('NavigationProvider.tsx');

export const NavigationProvider = ({children}: PropsWithChildren) => {
  const {navTheme, theme} = useAppTheme();
  const {appConfig} = useConfig();
  const {oobeCompleted} = useOobe();
  const serverUrl = useServerUrl();
  const canonicalHostnames = appConfig.apiClientConfig.canonicalHostnames;

  /**
   * Add the session-dependent checks to the static linking config. ForeignLinkHandler tells the
   * user about the links this drops for belonging to another server.
   */
  const linking = useMemo<LinkingOptions<RootStackParamList>>(
    () => ({
      ...navigationLinking,
      filter: url => {
        if (navigationLinking.filter && !navigationLinking.filter(url)) {
          return false;
        }
        const shouldRoute = shouldRouteIncomingLink(url, oobeCompleted, serverUrl, canonicalHostnames);
        if (!shouldRoute) {
          logger.info('Not routing incoming link', url);
        }
        return shouldRoute;
      },
    }),
    [oobeCompleted, serverUrl, canonicalHostnames],
  );

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
    <NavigationContainer ref={navigationRef} linking={linking} theme={navTheme} onStateChange={handleStateChange}>
      <PaperProvider theme={theme}>
        <HeaderButtonsProvider stackType={'native'}>{children as ReactElement}</HeaderButtonsProvider>
      </PaperProvider>
    </NavigationContainer>
  );
};
