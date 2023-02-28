/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect} from 'react';
import {LinkingOptions, NavigationContainer} from '@react-navigation/native';
import {Provider as PaperProvider} from 'react-native-paper';
import {setupChannels} from './src/libraries/Notifications/Channels';
import {initialSettings} from './src/libraries/AppSettings';
import {twitarrTheme, twitarrThemeDark} from './src/styles/Theme';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {apiQueryV3, setupAxiosStuff} from './src/libraries/Network/APIClient';
import {useColorScheme} from 'react-native';
import {BottomTabNavigator} from './src/components/Navigation/Tabs/BottomTabNavigator/BottomTabNavigator';
import {UserNotificationDataProvider} from './src/components/Context/Providers/UserNotificationDataProvider';
import {UserDataProvider} from './src/components/Context/Providers/UserDataProvider';
import {AppPermissions} from './src/libraries/AppPermissions';
import {setupInitialNotification} from './src/libraries/Notifications/InitialNotification';
import {AppStateProvider} from './src/components/Context/Providers/AppStateProvider';
import {ErrorHandlerProvider} from './src/components/Context/Providers/ErrorHandlerProvider';
import {NotificationDataPoller} from './src/components/Libraries/Notifications/NotificationDataPoller';
import {ForegroundService} from './src/components/Libraries/Notifications/ForegroundService';
import {NotificationDataListener} from './src/components/Libraries/Notifications/NotificationDataListener';

// https://tanstack.com/query/latest/docs/react/overview
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: apiQueryV3,
      cacheTime: 0,
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

  const deepLinksConf = {
    screens: {
      HomeTab: 'hometab',
      SeamailTab: 'seamailtab',
      TwitarrTab: 'twitarrtab/:resource?/:id?',
      SettingsTab: 'settingstab',
    },
  };

  const linking: LinkingOptions<any> = {
    prefixes: ['tricordarr://'],
    config: deepLinksConf
  }

  return (
    <NavigationContainer linking={linking}>
      <PaperProvider theme={colorScheme === 'dark' ? twitarrThemeDark : twitarrTheme}>
        <ErrorHandlerProvider>
          <QueryClientProvider client={queryClient}>
            <AppStateProvider>
              <UserDataProvider>
                <UserNotificationDataProvider>
                  <NotificationDataPoller />
                  <ForegroundService />
                  <NotificationDataListener />
                  <BottomTabNavigator />
                </UserNotificationDataProvider>
              </UserDataProvider>
            </AppStateProvider>
          </QueryClientProvider>
        </ErrorHandlerProvider>
      </PaperProvider>
    </NavigationContainer>
  );
}

export default App;
