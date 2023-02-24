/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {createContext, useEffect, useState} from 'react';

import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Provider as PaperProvider} from 'react-native-paper';
import {MainView} from './src/components/Screens/Main';
import {setupChannels} from './src/notifications/Channels';
import {AppSettings, initialSettings} from './src/libraries/AppSettings';
import {SettingsView} from './src/components/Screens/Settings/Settings';
import {twitarrTheme, twitarrThemeDark} from './src/styles/Theme';
import {SettingDetail} from './src/components/Screens/Settings/SettingDetail';
import {NotificationSettings} from './src/components/Screens/Settings/NotificationSettings';
import {NetworkInfoSettings} from './src/components/Screens/Settings/NetworkInfoSettings';
import {AccountSettings} from './src/components/Screens/Settings/AccountSettings';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {apiQueryV3, setupAxiosStuff} from './src/libraries/APIClient';
import {StorageKeysSettings} from './src/components/Screens/Settings/StorageKeys';
import {startForegroundServiceWorker, stopForegroundServiceWorker} from './src/libraries/Service';
import {ServerConnectionSettings} from "./src/components/Screens/Settings/ServerConnectionSettings";
import {useColorScheme} from 'react-native';

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

export const UserContext = createContext({});

function App(): JSX.Element {
  // Set up the navigation stack.
  const Stack = createNativeStackNavigator();
  const colorScheme = useColorScheme();

  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  setupChannels().catch(error => {
    console.error('Error setting up notification channels:', error);
  });

  initialSettings().catch(error => {
    console.error('Error with settings:', error);
  });

  startForegroundServiceWorker().catch(error => {
    console.error('Error starting FGS:', error);
  });

  // @TODO move the logic to the detailed logincontext type that Ben talked about.
  useEffect(() => {
    console.log('Calling useEffect from Main App.');
    async function checkForLogin() {
      if (!!(await AppSettings.USERNAME.getValue()) && !!(await AppSettings.AUTH_TOKEN.getValue())) {
        setIsUserLoggedIn(true);
        startForegroundServiceWorker().catch(error => {
          console.error('Error starting FGS:', error);
        });
      } else {
        stopForegroundServiceWorker().catch(error => {
          console.error('Error stopping FGS:', error);
        });
      }
    }
    checkForLogin().catch(console.error);
  }, [isUserLoggedIn]);

  return (
    <NavigationContainer>
      <PaperProvider theme={colorScheme === 'dark' ? twitarrThemeDark : twitarrTheme}>
        <QueryClientProvider client={queryClient}>
          <UserContext.Provider value={{isUserLoggedIn, setIsUserLoggedIn}}>
            <Stack.Navigator>
              <Stack.Screen name={'Home'} component={MainView} />
              <Stack.Screen name={'Settings'} component={SettingsView} />
              <Stack.Screen name={'SettingDetail'} component={SettingDetail} />
              <Stack.Screen name={'NotificationSettings'} component={NotificationSettings} />
              <Stack.Screen name={'NetworkInfoSettings'} component={NetworkInfoSettings} />
              <Stack.Screen name={'StorageKeysSettings'} component={StorageKeysSettings} />
              <Stack.Screen name={'AccountSettings'} component={AccountSettings} />
              <Stack.Screen name={'ServerConnectionSettings'} component={ServerConnectionSettings} />
            </Stack.Navigator>
          </UserContext.Provider>
        </QueryClientProvider>
      </PaperProvider>
    </NavigationContainer>
  );
}

export default App;
