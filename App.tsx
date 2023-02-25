/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {Provider as PaperProvider} from 'react-native-paper';
import {setupChannels} from './src/notifications/Channels';
import {initialSettings} from './src/libraries/AppSettings';
import {twitarrTheme, twitarrThemeDark} from './src/styles/Theme';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {apiQueryV3, setupAxiosStuff} from './src/libraries/APIClient';
import {startForegroundServiceWorker} from './src/libraries/Service';
import {useColorScheme} from 'react-native';
import {BottomTabNavigator} from './src/components/Tabs/BottomTabNavigator/BottomTabNavigator';
import {UserProvider} from './src/components/Providers/UserProvider';
import {UserNotificationDataProvider} from './src/components/Providers/UserNotificationDataProvider';

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

  setupChannels().catch(error => {
    console.error('Error setting up notification channels:', error);
  });

  initialSettings().catch(error => {
    console.error('Error with settings:', error);
  });

  startForegroundServiceWorker().catch(error => {
    console.error('Error starting FGS:', error);
  });

  return (
    <NavigationContainer>
      <PaperProvider theme={colorScheme === 'dark' ? twitarrThemeDark : twitarrTheme}>
        <QueryClientProvider client={queryClient}>
          <UserProvider>
            <UserNotificationDataProvider>
              <BottomTabNavigator />
            </UserNotificationDataProvider>
          </UserProvider>
        </QueryClientProvider>
      </PaperProvider>
    </NavigationContainer>
  );
}

export default App;
