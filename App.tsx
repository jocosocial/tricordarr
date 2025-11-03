/**
 * Tricordarr Secondary Entrypoint.
 * index.js is still the start. The good stuff goes here.
 */

import React, {useEffect} from 'react';
import {LogBox} from 'react-native';
// import ViewReactNativeStyleAttributes from 'react-native/Libraries/Components/View/ReactNativeStyleAttributes';
// https://reactnavigation.org/docs/drawer-layout/
import 'react-native-gesture-handler';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {KeyboardProvider} from 'react-native-keyboard-controller';
import {Portal} from 'react-native-paper';
import {en as paperEn, registerTranslation} from 'react-native-paper-dates';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {HeaderButtonsProvider} from 'react-navigation-header-buttons/HeaderButtonsProvider';

import {NotificationDataListener} from '#src/Components/Libraries/Notifications/NotificationDataListener';
import {NotificationDataPoller} from '#src/Components/Libraries/Notifications/NotificationDataPoller';
import {PushNotificationService} from '#src/Components/Libraries/Notifications/PushNotificationService';
import {AppEventHandler} from '#src/Components/Navigation/AppEventHandler';
import {AppNavigationThemeProvider} from '#src/Context/Providers/AppNavigationThemeProvider.tsx';
import {AuthProvider} from '#src/Context/Providers/AuthProvider';
import {ConfigProvider} from '#src/Context/Providers/ConfigProvider';
import {CriticalErrorProvider} from '#src/Context/Providers/CriticalErrorProvider.tsx';
import {CruiseProvider} from '#src/Context/Providers/CruiseProvider';
import {DrawerProvider} from '#src/Context/Providers/DrawerProvider';
import {ErrorHandlerProvider} from '#src/Context/Providers/ErrorHandlerProvider';
import {FeatureProvider} from '#src/Context/Providers/FeatureProvider';
import {FilterProvider} from '#src/Context/Providers/FilterProvider';
import {LoadingProvider} from '#src/Context/Providers/LoadingProvider';
import {ModalProvider} from '#src/Context/Providers/ModalProvider';
import {PrivilegeProvider} from '#src/Context/Providers/PrivilegeProvider';
import {SelectionProvider} from '#src/Context/Providers/SelectionProvider.tsx';
import {SnackbarProvider} from '#src/Context/Providers/SnackbarProvider.tsx';
import {SocketProvider} from '#src/Context/Providers/SocketProvider';
import {StyleProvider} from '#src/Context/Providers/StyleProvider';
import {SwiftarrQueryClientProvider} from '#src/Context/Providers/SwiftarrQueryClientProvider';
import {TwitarrProvider} from '#src/Context/Providers/TwitarrProvider';
import {UserNotificationDataProvider} from '#src/Context/Providers/UserNotificationDataProvider';
import {setupChannels} from '#src/Libraries/Notifications/Channels';
import {setupInitialNotification} from '#src/Libraries/Notifications/InitialNotification';
import {registerFgsWorker} from '#src/Libraries/Notifications/Push/Android/ForegroundService';
import {configureImageCache} from '#src/Libraries/Storage/ImageStorage.ts';
import {RootStackNavigator} from '#src/Navigation/Stacks/RootStackNavigator';

// https://github.com/facebook/react-native/issues/30034
// https://phab.comm.dev/D6193
// react-native has an issue with inverted lists on Android, and it got worse
// with Android 13. To avoid it we patch a react-native style, but that style
// got deprecated in React Native 0.70. For now the deprecation is limited to a
// JS runtime check, which we disable here.
// @ts-ignore
//
// 20251013 RN 0.81 apparently this is no longer needed sooooo yolo!
// ViewReactNativeStyleAttributes.scaleY = true;

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
            <KeyboardProvider>
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
                                                    <PushNotificationService />
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
            </KeyboardProvider>
          </AppNavigationThemeProvider>
        </ConfigProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

export default App;
