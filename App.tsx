/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {Provider as PaperProvider} from 'react-native-paper';
import {setupChannels} from './src/notifications/Channels';
import {initialSettings} from './src/libraries/AppSettings';
import {twitarrTheme, twitarrThemeDark} from './src/styles/Theme';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {apiQueryV3, setupAxiosStuff} from './src/libraries/APIClient';
import {useColorScheme} from 'react-native';
import {bootstrap} from './src/notifications';
import {BottomTabNavigator} from './src/components/Tabs/BottomTabNavigator/BottomTabNavigator';
import {UserNotificationDataProvider} from './src/components/Providers/UserNotificationDataProvider';
import {UserDataProvider} from './src/components/Providers/UserDataProvider';

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

  useEffect(() => {
    console.log('Calling useEffect from Main App.');
    bootstrap().catch(console.error);
  }, []);

  return (
    <NavigationContainer>
      <PaperProvider theme={colorScheme === 'dark' ? twitarrThemeDark : twitarrTheme}>
        <QueryClientProvider client={queryClient}>
          <UserDataProvider>
            <UserNotificationDataProvider>
              <BottomTabNavigator />
            </UserNotificationDataProvider>
          </UserDataProvider>
        </QueryClientProvider>
      </PaperProvider>
    </NavigationContainer>
  );
}

export default App;
