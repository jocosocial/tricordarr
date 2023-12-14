/**
 * Tricordarr Secondary Entrypoint.
 * index.js is still the start. The good stuff goes here.
 */

import React, {useEffect} from 'react';
import {LogBox, useColorScheme} from 'react-native';
import {adaptNavigationTheme, Portal, Provider as PaperProvider} from 'react-native-paper';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en.json';
import {DefaultTheme, NavigationContainer} from '@react-navigation/native';
import {QueryClientProvider} from '@tanstack/react-query';
import {setupChannels} from './src/libraries/Notifications/Channels';
import {twitarrTheme, twitarrThemeDark} from './src/styles/Theme';
import {configureAxios, SwiftarrQueryClient} from './src/libraries/Network/APIClient';
import {UserNotificationDataProvider} from './src/components/Context/Providers/UserNotificationDataProvider';
import {UserDataProvider} from './src/components/Context/Providers/UserDataProvider';
import {setupInitialNotification} from './src/libraries/Notifications/InitialNotification';
import {ErrorHandlerProvider} from './src/components/Context/Providers/ErrorHandlerProvider';
import {ForegroundService} from './src/components/Libraries/Notifications/ForegroundService';
import {NotificationDataListener} from './src/components/Libraries/Notifications/NotificationDataListener';
import {StyleProvider} from './src/components/Context/Providers/StyleProvider';
import {ModalProvider} from './src/components/Context/Providers/ModalProvider';
import {UserRelationsProvider} from './src/components/Context/Providers/UserRelationsProvider';
import {TwitarrProvider} from './src/components/Context/Providers/TwitarrProvider';
import {PrivilegeProvider} from './src/components/Context/Providers/PrivilegeProvider';
import {SocketProvider} from './src/components/Context/Providers/SocketProvider';
import {navigationLinking} from './src/libraries/Linking';
import {AppEventHandler} from './src/components/Navigation/AppEventHandler';
import {AuthProvider} from './src/components/Context/Providers/AuthProvider';
import {ConfigProvider} from './src/components/Context/Providers/ConfigProvider';
import moment from 'moment-timezone';
import {registerFgsWorker} from './src/libraries/Service';
import {RootStackNavigator} from './src/components/Navigation/Stacks/RootStackNavigator';
import {DrawerProvider} from './src/components/Context/Providers/DrawerProvider';
import {HeaderButtonsProvider} from 'react-navigation-header-buttons';
import {CruiseProvider} from './src/components/Context/Providers/CruiseProvider';
import {FilterProvider} from './src/components/Context/Providers/FilterProvider';
import {registerTranslation, en as paperEn} from 'react-native-paper-dates';
import {FeatureProvider} from './src/components/Context/Providers/FeatureProvider';
import {NotificationDataPoller} from './src/components/Libraries/Notifications/NotificationDataPoller';
// https://reactnavigation.org/docs/drawer-layout/
import 'react-native-gesture-handler';

// https://github.com/facebook/react-native/issues/30034
// https://phab.comm.dev/D6193
// react-native has an issue with inverted lists on Android, and it got worse
// with Android 13. To avoid it we patch a react-native style, but that style
// got deprecated in React Native 0.70. For now the deprecation is limited to a
// JS runtime check, which we disable here.
// @ts-ignore
import ViewReactNativeStyleAttributes from 'react-native/Libraries/Components/View/ReactNativeStyleAttributes';
import {SwiftarrQueryClientProvider} from './src/components/Context/Providers/SwiftarrQueryClientProvider';
ViewReactNativeStyleAttributes.scaleY = true;

// For development, disable warning popups because I already respond to them.
if (__DEV__) {
  LogBox.ignoreLogs(['AxiosError', 'Websockets.ts']);
}

console.log('[App.tsx] Tricordarr start!');

// Time and locale setup, used in various places within the app.
TimeAgo.addDefaultLocale(en);
// @TODO this timezone is a hack, until we figure out what to do about the API.
moment.tz.link('AST|America/Santo_Domingo');
registerTranslation('en', paperEn);

// Configure network interceptors
configureAxios();

// Declare what the Foreground Service worker function should be.
registerFgsWorker();

// https://callstack.github.io/react-native-paper/docs/guides/theming
const {LightTheme: navLightTheme} = adaptNavigationTheme({reactNavigationLight: DefaultTheme});
const {DarkTheme: navDarkTheme} = adaptNavigationTheme({reactNavigationDark: DefaultTheme});

function App(): JSX.Element {
  const colorScheme = useColorScheme();

  setupChannels().catch(error => {
    console.error('Error setting up notification channels:', error);
  });

  useEffect(() => {
    console.log('[App.tsx] Calling useEffect from Main App.');
    setupInitialNotification().catch(console.error);
  }, []);

  /**
   * Known Dependencies:
   * These were of course not determined when I did the big refactor around LFGs/Forums
   * when it would have been useful...
   *
   * ModalProvider needs UserRelationsProvider for blocks/mutes/favorites to mutate successfully.
   */
  return (
    <NavigationContainer linking={navigationLinking} theme={colorScheme === 'dark' ? navDarkTheme : navLightTheme}>
      <PaperProvider theme={colorScheme === 'dark' ? twitarrThemeDark : twitarrTheme}>
        <SwiftarrQueryClientProvider>
          <StyleProvider>
            <ErrorHandlerProvider>
              <ConfigProvider>
                <AuthProvider>
                  <UserDataProvider>
                    <PrivilegeProvider>
                      <SocketProvider>
                        <TwitarrProvider>
                          <UserRelationsProvider>
                            <UserNotificationDataProvider>
                              <ModalProvider>
                                <Portal.Host>
                                  <HeaderButtonsProvider stackType={'native'}>
                                    <CruiseProvider>
                                      <DrawerProvider>
                                        <FilterProvider>
                                          <FeatureProvider>
                                            <AppEventHandler />
                                            <ForegroundService />
                                            <NotificationDataListener />
                                            <NotificationDataPoller />
                                            <RootStackNavigator />
                                          </FeatureProvider>
                                        </FilterProvider>
                                      </DrawerProvider>
                                    </CruiseProvider>
                                  </HeaderButtonsProvider>
                                </Portal.Host>
                              </ModalProvider>
                            </UserNotificationDataProvider>
                          </UserRelationsProvider>
                        </TwitarrProvider>
                      </SocketProvider>
                    </PrivilegeProvider>
                  </UserDataProvider>
                </AuthProvider>
              </ConfigProvider>
            </ErrorHandlerProvider>
          </StyleProvider>
        </SwiftarrQueryClientProvider>
      </PaperProvider>
    </NavigationContainer>
  );
}

export default App;
