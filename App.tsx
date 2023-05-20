/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {Provider as PaperProvider} from 'react-native-paper';
import {setupChannels} from './src/libraries/Notifications/Channels';
import {initialSettings} from './src/libraries/AppSettings';
import {twitarrTheme, twitarrThemeDark} from './src/styles/Theme';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {apiQueryV3, setupAxiosStuff} from './src/libraries/Network/APIClient';
import {useColorScheme} from 'react-native';
import {BottomTabNavigator} from './src/components/Navigation/Tabs/BottomTabNavigator';
import {UserNotificationDataProvider} from './src/components/Context/Providers/UserNotificationDataProvider';
import {UserDataProvider} from './src/components/Context/Providers/UserDataProvider';
import {AppPermissions} from './src/libraries/AppPermissions';
import {setupInitialNotification} from './src/libraries/Notifications/InitialNotification';
import {ErrorHandlerProvider} from './src/components/Context/Providers/ErrorHandlerProvider';
// import {NotificationDataPoller} from './src/components/Libraries/Notifications/NotificationDataPoller';
import {ForegroundService} from './src/components/Libraries/Notifications/ForegroundService';
import {NotificationDataListener} from './src/components/Libraries/Notifications/NotificationDataListener';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en.json';
import {StyleProvider} from './src/components/Context/Providers/StyleProvider';
import {ModalProvider} from './src/components/Context/Providers/ModalProvider';
import {UserRelationsProvider} from './src/components/Context/Providers/UserRelationsProvider';
import {TwitarrProvider} from './src/components/Context/Providers/TwitarrProvider';
import {PrivilegeProvider} from './src/components/Context/Providers/PrivilegeProvider';
import {SocketProvider} from './src/components/Context/Providers/SocketProvider';
import {navigationLinking} from './src/libraries/Linking';

// https://github.com/facebook/react-native/issues/30034
// https://phab.comm.dev/D6193
// react-native has an issue with inverted lists on Android, and it got worse
// with Android 13. To avoid it we patch a react-native style, but that style
// got deprecated in React Native 0.70. For now the deprecation is limited to a
// JS runtime check, which we disable here.
import ViewReactNativeStyleAttributes from 'react-native/Libraries/Components/View/ReactNativeStyleAttributes';
import {EventHandler} from './src/components/Navigation/EventHandler';
import {AuthProvider} from './src/components/Context/Providers/AuthProvider';
ViewReactNativeStyleAttributes.scaleY = true;

TimeAgo.addDefaultLocale(en);

// https://tanstack.com/query/latest/docs/react/overview
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: apiQueryV3,
      cacheTime: 0,
      retry: 2,
    },
  },
});
setupAxiosStuff();

function App(): JSX.Element {
  const colorScheme = useColorScheme();

  AppPermissions.requestRequiredPermissions();

  setupChannels().catch(error => {
    console.error('Error setting up notification channels:', error);
  });

  initialSettings().catch(error => {
    console.error('Error with settings:', error);
  });

  useEffect(() => {
    console.log('Calling useEffect from Main App.');
    setupInitialNotification().catch(console.error);
  }, []);

  return (
    <NavigationContainer linking={navigationLinking}>
      <PaperProvider theme={colorScheme === 'dark' ? twitarrThemeDark : twitarrTheme}>
        <StyleProvider>
          <QueryClientProvider client={queryClient}>
            <TwitarrProvider>
              <ErrorHandlerProvider>
                <ModalProvider>
                  <AuthProvider></AuthProvider>
                  {/*<UserDataProvider>*/}
                  {/*  <PrivilegeProvider>*/}
                  {/*    <SocketProvider>*/}
                  {/*      <UserRelationsProvider>*/}
                  {/*        <UserNotificationDataProvider>*/}
                  {/*          /!*<NotificationDataPoller />*!/*/}
                  {/*          <EventHandler />*/}
                  {/*          <ForegroundService />*/}
                  {/*          <NotificationDataListener />*/}
                  {/*          <BottomTabNavigator />*/}
                  {/*        </UserNotificationDataProvider>*/}
                  {/*      </UserRelationsProvider>*/}
                  {/*    </SocketProvider>*/}
                  {/*  </PrivilegeProvider>*/}
                  {/*</UserDataProvider>*/}
                </ModalProvider>
              </ErrorHandlerProvider>
            </TwitarrProvider>
          </QueryClientProvider>
        </StyleProvider>
      </PaperProvider>
    </NavigationContainer>
  );
}

export default App;
