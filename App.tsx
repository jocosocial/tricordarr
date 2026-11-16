/**
 * Tricordarr Secondary Entrypoint.
 * index.js is still the start. The good stuff goes here.
 */

import React, {useEffect} from 'react';
import {LogBox, StyleSheet} from 'react-native';
// import ViewReactNativeStyleAttributes from 'react-native/Libraries/Components/View/ReactNativeStyleAttributes';
// https://reactnavigation.org/docs/drawer-layout/
import 'react-native-gesture-handler';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {KeyboardProvider} from 'react-native-keyboard-controller';
import {en as paperEn, registerTranslation} from 'react-native-paper-dates';
import {initialWindowMetrics, SafeAreaProvider} from 'react-native-safe-area-context';

import {TricordarrApp} from '#src/Components/Libraries/TricordarrApp';
import {ConfigSessionProvider} from '#src/Context/Providers/ConfigSessionProvider';
import {CriticalErrorProvider} from '#src/Context/Providers/CriticalErrorProvider.tsx';
import {CustomEmojiProvider} from '#src/Context/Providers/CustomEmojiProvider';
import {EnableUserNotificationProvider} from '#src/Context/Providers/EnableUserNotificationProvider';
import {ErrorHandlerProvider} from '#src/Context/Providers/ErrorHandlerProvider';
import {FilterProvider} from '#src/Context/Providers/FilterProvider';
import {HelperProvider} from '#src/Context/Providers/HelperProvider';
import {LoadingProvider} from '#src/Context/Providers/LoadingProvider';
import {NavigationProvider} from '#src/Context/Providers/NavigationProvider';
import {OobeProvider} from '#src/Context/Providers/OobeProvider';
import {PermissionsProvider} from '#src/Context/Providers/PermissionsProvider';
import {PostReactionProvider} from '#src/Context/Providers/PostReactionProvider';
import {PreRegistrationProvider} from '#src/Context/Providers/PreRegistrationProvider';
import {SessionBoundaryProvider} from '#src/Context/Providers/SessionBoundaryProvider';
import {ShellProvider} from '#src/Context/Providers/ShellProvider';
import {SignOutProvider} from '#src/Context/Providers/SignOutProvider';
import {SnackbarProvider} from '#src/Context/Providers/SnackbarProvider';
import {StyleProvider} from '#src/Context/Providers/StyleProvider';
import {SwiftarrQueryClientProvider} from '#src/Context/Providers/SwiftarrQueryClientProvider';
import {ThemeProvider} from '#src/Context/Providers/ThemeProvider';
import {TwitarrProvider} from '#src/Context/Providers/TwitarrProvider';
import {setupChannels} from '#src/Libraries/Notifications/Channels';
import {setupInitialNotification} from '#src/Libraries/Notifications/InitialNotification';
import {registerFgsWorker} from '#src/Libraries/Notifications/Push/Android/ForegroundService';

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
   * LinkingProvider needs ConfigProvider and SwiftarrQueryClientProvider.
   * AppNavigationThemeProvider should be within SafeAreaProvider.
   * ConfigSessionProvider bundles ConfigProvider, SessionProvider (needs device config for urlPrefix and
   * default preferences) and EffectiveConfigProvider (needs both; it is what `useConfig()` reads).
   * SwiftarrQueryClientProvider needs SessionProvider for currentSession.
   * SessionBoundaryProvider remounts everything beneath it on a session change (one QueryClient per
   * session). Everything above it is device-scoped.
   */
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <GestureHandlerRootView style={styles.root}>
        <ConfigSessionProvider>
          <OobeProvider>
            <PreRegistrationProvider>
              <PermissionsProvider>
                <ThemeProvider>
                  <NavigationProvider>
                    <KeyboardProvider>
                      <StyleProvider>
                        <ErrorHandlerProvider>
                          <SnackbarProvider>
                            <SessionBoundaryProvider>
                              <SwiftarrQueryClientProvider>
                                <LoadingProvider>
                                  <CriticalErrorProvider>
                                    <TwitarrProvider>
                                      <EnableUserNotificationProvider>
                                        <FilterProvider>
                                          <SignOutProvider>
                                            <CustomEmojiProvider>
                                              <PostReactionProvider>
                                                <HelperProvider>
                                                  <ShellProvider>
                                                    <TricordarrApp />
                                                  </ShellProvider>
                                                </HelperProvider>
                                              </PostReactionProvider>
                                            </CustomEmojiProvider>
                                          </SignOutProvider>
                                        </FilterProvider>
                                      </EnableUserNotificationProvider>
                                    </TwitarrProvider>
                                  </CriticalErrorProvider>
                                </LoadingProvider>
                              </SwiftarrQueryClientProvider>
                            </SessionBoundaryProvider>
                          </SnackbarProvider>
                        </ErrorHandlerProvider>
                      </StyleProvider>
                    </KeyboardProvider>
                  </NavigationProvider>
                </ThemeProvider>
              </PermissionsProvider>
            </PreRegistrationProvider>
          </OobeProvider>
        </ConfigSessionProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

/**
 * GestureHandlerRootView must fill the window (`flex: 1`). useStyles / commonStyles.flex
 * are unavailable here because StyleProvider sits inside this view.
 */
const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default App;
