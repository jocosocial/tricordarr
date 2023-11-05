/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect} from 'react';
import {useColorScheme} from 'react-native';
import {adaptNavigationTheme, Provider as PaperProvider} from 'react-native-paper';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en.json';
import {DefaultTheme, NavigationContainer} from '@react-navigation/native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {setupChannels} from './src/libraries/Notifications/Channels';
import {twitarrTheme, twitarrThemeDark} from './src/styles/Theme';
import {apiQueryV3, configureAxios} from './src/libraries/Network/APIClient';
import {UserNotificationDataProvider} from './src/components/Context/Providers/UserNotificationDataProvider';
import {UserDataProvider} from './src/components/Context/Providers/UserDataProvider';
import {AppPermissions} from './src/libraries/AppPermissions';
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

// https://github.com/facebook/react-native/issues/30034
// https://phab.comm.dev/D6193
// react-native has an issue with inverted lists on Android, and it got worse
// with Android 13. To avoid it we patch a react-native style, but that style
// got deprecated in React Native 0.70. For now the deprecation is limited to a
// JS runtime check, which we disable here.
// @ts-ignore
import ViewReactNativeStyleAttributes from 'react-native/Libraries/Components/View/ReactNativeStyleAttributes';

ViewReactNativeStyleAttributes.scaleY = true;

// https://reactnavigation.org/docs/drawer-layout/
import 'react-native-gesture-handler';

TimeAgo.addDefaultLocale(en);
// @TODO this timezone is a hack, until we figure out what to do about the API.
moment.tz.link('AST|America/Santo_Domingo');

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
configureAxios();

import {registerFgsWorker} from './src/libraries/Service';
import {RootStackNavigator} from './src/components/Navigation/Stacks/RootStackNavigator';
import {DrawerProvider} from './src/components/Context/Providers/DrawerProvider';
import {HeaderButtonsProvider} from 'react-navigation-header-buttons';
import {CruiseProvider} from './src/components/Context/Providers/CruiseProvider';
import {ScheduleFilterProvider} from './src/components/Context/Providers/ScheduleFilterProvider';

registerFgsWorker();

// https://callstack.github.io/react-native-paper/docs/guides/theming
const {LightTheme: navLightTheme} = adaptNavigationTheme({reactNavigationLight: DefaultTheme});
const {DarkTheme: navDarkTheme} = adaptNavigationTheme({reactNavigationDark: DefaultTheme});

function App(): JSX.Element {
  const colorScheme = useColorScheme();

  AppPermissions.requestRequiredPermissions();

  setupChannels().catch(error => {
    console.error('Error setting up notification channels:', error);
  });

  useEffect(() => {
    console.log('Calling useEffect from Main App.');
    setupInitialNotification().catch(console.error);
  }, []);

  return (
    <NavigationContainer linking={navigationLinking} theme={colorScheme === 'dark' ? navDarkTheme : navLightTheme}>
      <PaperProvider theme={colorScheme === 'dark' ? twitarrThemeDark : twitarrTheme}>
        <StyleProvider>
          <HeaderButtonsProvider stackType={'native'}>
            <ConfigProvider>
              <CruiseProvider>
                <QueryClientProvider client={queryClient}>
                  <TwitarrProvider>
                    <ErrorHandlerProvider>
                      <ModalProvider>
                        <AuthProvider>
                          <UserDataProvider>
                            <PrivilegeProvider>
                              <SocketProvider>
                                <UserRelationsProvider>
                                  <UserNotificationDataProvider>
                                    <DrawerProvider>
                                      <ScheduleFilterProvider>
                                        <AppEventHandler />
                                        <ForegroundService />
                                        <NotificationDataListener />
                                        <RootStackNavigator />
                                      </ScheduleFilterProvider>
                                    </DrawerProvider>
                                  </UserNotificationDataProvider>
                                </UserRelationsProvider>
                              </SocketProvider>
                            </PrivilegeProvider>
                          </UserDataProvider>
                        </AuthProvider>
                      </ModalProvider>
                    </ErrorHandlerProvider>
                  </TwitarrProvider>
                </QueryClientProvider>
              </CruiseProvider>
            </ConfigProvider>
          </HeaderButtonsProvider>
        </StyleProvider>
      </PaperProvider>
    </NavigationContainer>
  );
}

export default App;
