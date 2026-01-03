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
import {en as paperEn, registerTranslation} from 'react-native-paper-dates';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import {AppEventHandler} from '#src/Components/Libraries/AppEventHandler';
import {AppFocusHandler} from '#src/Components/Libraries/AppFocusHandler';
import {NotificationDataListener} from '#src/Components/Libraries/Notifications/NotificationDataListener';
import {NotificationDataPoller} from '#src/Components/Libraries/Notifications/NotificationDataPoller';
import {PushNotificationService} from '#src/Components/Libraries/Notifications/PushNotificationService';
import {AuthProvider} from '#src/Context/Providers/AuthProvider';
import {ClientSettingsProvider} from '#src/Context/Providers/ClientSettingsProvider';
import {ConfigProvider} from '#src/Context/Providers/ConfigProvider';
import {CriticalErrorProvider} from '#src/Context/Providers/CriticalErrorProvider.tsx';
import {CruiseProvider} from '#src/Context/Providers/CruiseProvider';
import {EnableUserNotificationProvider} from '#src/Context/Providers/EnableUserNotificationProvider';
import {ErrorHandlerProvider} from '#src/Context/Providers/ErrorHandlerProvider';
import {FeatureProvider} from '#src/Context/Providers/FeatureProvider';
import {FilterProvider} from '#src/Context/Providers/FilterProvider';
import {LoadingProvider} from '#src/Context/Providers/LoadingProvider';
import {NavigationProvider} from '#src/Context/Providers/NavigationProvider';
import {PermissionsProvider} from '#src/Context/Providers/PermissionsProvider';
import {PrivilegeProvider} from '#src/Context/Providers/PrivilegeProvider';
import {RoleProvider} from '#src/Context/Providers/RoleProvider';
import {OobeProvider} from '#src/Context/Providers/OobeProvider';
import {PreRegistrationProvider} from '#src/Context/Providers/PreRegistrationProvider';
import {SessionProvider} from '#src/Context/Providers/SessionProvider';
import {ShellProvider} from '#src/Context/Providers/ShellProvider';
import {SnackbarProvider} from '#src/Context/Providers/SnackbarProvider';
import {SocketProvider} from '#src/Context/Providers/SocketProvider';
import {StyleProvider} from '#src/Context/Providers/StyleProvider';
import {SwiftarrQueryClientProvider} from '#src/Context/Providers/SwiftarrQueryClientProvider';
import {ThemeProvider} from '#src/Context/Providers/ThemeProvider';
import {TwitarrProvider} from '#src/Context/Providers/TwitarrProvider';
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
   * SessionProvider needs ConfigProvider for defaultAppConfig.
   * AuthProvider needs SessionProvider for currentSession.
   * SwiftarrQueryClientProvider needs SessionProvider for currentSession.
   */
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView>
        <ConfigProvider>
          <SessionProvider>
            <OobeProvider>
              <PreRegistrationProvider>
                <PermissionsProvider>
              <ThemeProvider>
                <NavigationProvider>
                  <KeyboardProvider>
                    <StyleProvider>
                      <ErrorHandlerProvider>
                        <AuthProvider>
                          <SnackbarProvider>
                            <SwiftarrQueryClientProvider>
                              <LoadingProvider>
                                <CriticalErrorProvider>
                                  <PrivilegeProvider>
                                    <RoleProvider>
                                      <SocketProvider>
                                        <TwitarrProvider>
                                          <EnableUserNotificationProvider>
                                            <FeatureProvider>
                                              <ClientSettingsProvider>
                                                <CruiseProvider>
                                                  <FilterProvider>
                                                    <ShellProvider>
                                                      <AppEventHandler />
                                                      <AppFocusHandler />
                                                      <PushNotificationService />
                                                      <NotificationDataListener />
                                                      <NotificationDataPoller />
                                                      <RootStackNavigator />
                                                    </ShellProvider>
                                                  </FilterProvider>
                                                </CruiseProvider>
                                              </ClientSettingsProvider>
                                            </FeatureProvider>
                                          </EnableUserNotificationProvider>
                                        </TwitarrProvider>
                                      </SocketProvider>
                                    </RoleProvider>
                                  </PrivilegeProvider>
                                </CriticalErrorProvider>
                              </LoadingProvider>
                            </SwiftarrQueryClientProvider>
                          </SnackbarProvider>
                        </AuthProvider>
                      </ErrorHandlerProvider>
                    </StyleProvider>
                  </KeyboardProvider>
                </NavigationProvider>
              </ThemeProvider>
                </PermissionsProvider>
              </PreRegistrationProvider>
            </OobeProvider>
          </SessionProvider>
        </ConfigProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

export default App;
