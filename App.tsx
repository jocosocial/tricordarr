/**
 * Tricordarr Secondary Entrypoint.
 * index.js is still the start. The good stuff goes here.
 */

import React, {useEffect} from 'react';
import {LogBox} from 'react-native';
import {Portal} from 'react-native-paper';
import {setupChannels} from '@tricordarr/libraries/Notifications/Channels';
import {UserNotificationDataProvider} from '@tricordarr/components/Context/Providers/UserNotificationDataProvider';
import {setupInitialNotification} from '@tricordarr/libraries/Notifications/InitialNotification';
import {ErrorHandlerProvider} from '@tricordarr/components/Context/Providers/ErrorHandlerProvider';
import {ForegroundService} from '@tricordarr/components/Libraries/Notifications/ForegroundService';
import {NotificationDataListener} from '@tricordarr/components/Libraries/Notifications/NotificationDataListener';
import {StyleProvider} from '@tricordarr/components/Context/Providers/StyleProvider';
import {ModalProvider} from '@tricordarr/components/Context/Providers/ModalProvider';
import {TwitarrProvider} from '@tricordarr/components/Context/Providers/TwitarrProvider';
import {PrivilegeProvider} from '@tricordarr/components/Context/Providers/PrivilegeProvider';
import {SocketProvider} from '@tricordarr/components/Context/Providers/SocketProvider';
import {AppEventHandler} from '@tricordarr/components/Navigation/AppEventHandler';
import {AuthProvider} from '@tricordarr/components/Context/Providers/AuthProvider';
import {ConfigProvider} from '@tricordarr/components/Context/Providers/ConfigProvider';
import {registerFgsWorker} from '@tricordarr/libraries/Service';
import {RootStackNavigator} from '@tricordarr/components/Navigation/Stacks/RootStackNavigator';
import {DrawerProvider} from '@tricordarr/components/Context/Providers/DrawerProvider';
import {HeaderButtonsProvider} from 'react-navigation-header-buttons';
import {CruiseProvider} from '@tricordarr/components/Context/Providers/CruiseProvider';
import {FilterProvider} from '@tricordarr/components/Context/Providers/FilterProvider';
import {registerTranslation, en as paperEn} from 'react-native-paper-dates';
import {FeatureProvider} from '@tricordarr/components/Context/Providers/FeatureProvider';
import {NotificationDataPoller} from '@tricordarr/components/Libraries/Notifications/NotificationDataPoller';
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
import {SwiftarrQueryClientProvider} from '@tricordarr/components/Context/Providers/SwiftarrQueryClientProvider';
import {LoadingProvider} from '@tricordarr/components/Context/Providers/LoadingProvider';
import {AppNavigationThemeProvider} from '@tricordarr/components/Context/Providers/AppNavigationThemeProvider.tsx';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {CriticalErrorProvider} from '@tricordarr/components/Context/Providers/CriticalErrorProvider.tsx';
import {SelectionProvider} from '@tricordarr/components/Context/Providers/SelectionProvider.tsx';
import {configureImageCache} from '@tricordarr/libraries/Storage/ImageStorage.ts';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {SnackbarProvider} from '@tricordarr/components/Context/Providers/SnackbarProvider.tsx';
ViewReactNativeStyleAttributes.scaleY = true;

// For development, disable warning popups because I already respond to them.
if (__DEV__) {
  LogBox.ignoreLogs(['AxiosError', 'Websockets.ts']);
}

console.log('[App.tsx] Tricordarr start!');
// Declare what the Foreground Service worker function should be.
// After the configureAxios() was deprecated and removed, this was acting kinda
// weird. Moved it further up in this file.
registerFgsWorker();

// Time and locale setup, used in various places within the app.
registerTranslation('en', paperEn);

// Set up image caching
configureImageCache();

function App(): React.JSX.Element {
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
   * SwiftarrQueryClientProvider needs ConfigProvider for cache busting.
   * StyleProvider needs PaperProvider for theming.
   * LoadingProvider needs SwiftarrQueryClientProvider for useIsRestoring.
   * SwiftarrQueryClientProvider requires ErrorHandlerProvider for global error callback.
   * LoadingProvider requires SafeAreaProvider since it's the first usage of AppView.
   * SnackbarProvider shouldn't need anything.
   * TwitarrProvider needs ConfigProvider and SwiftarrQueryClientProvider.
   * AppNavigationThemeProvider should be within SafeAreaProvider.
   */
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView>
        <ConfigProvider>
          <AppNavigationThemeProvider>
            <StyleProvider>
              <ErrorHandlerProvider>
                <SnackbarProvider>
                  <AuthProvider>
                    <SwiftarrQueryClientProvider>
                      <LoadingProvider>
                        <CriticalErrorProvider>
                          <PrivilegeProvider>
                            <SocketProvider>
                              <TwitarrProvider>
                                <UserNotificationDataProvider>
                                  <FeatureProvider>
                                    <ModalProvider>
                                      <Portal.Host>
                                        <HeaderButtonsProvider stackType={'native'}>
                                          <CruiseProvider>
                                            <DrawerProvider>
                                              <FilterProvider>
                                                <SelectionProvider>
                                                  <AppEventHandler />
                                                  <ForegroundService />
                                                  <NotificationDataListener />
                                                  <NotificationDataPoller />
                                                  <RootStackNavigator />
                                                </SelectionProvider>
                                              </FilterProvider>
                                            </DrawerProvider>
                                          </CruiseProvider>
                                        </HeaderButtonsProvider>
                                      </Portal.Host>
                                    </ModalProvider>
                                  </FeatureProvider>
                                </UserNotificationDataProvider>
                              </TwitarrProvider>
                            </SocketProvider>
                          </PrivilegeProvider>
                        </CriticalErrorProvider>
                      </LoadingProvider>
                    </SwiftarrQueryClientProvider>
                  </AuthProvider>
                </SnackbarProvider>
              </ErrorHandlerProvider>
            </StyleProvider>
          </AppNavigationThemeProvider>
        </ConfigProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

export default App;
