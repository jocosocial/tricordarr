/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';

import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Provider as PaperProvider} from 'react-native-paper';
import {MainView} from './src/components/Screens/Main';
import {setupChannels} from './src/notifications/Channels';
import {initialSettings} from './src/libraries/AppSettings';
import {SettingsView} from './src/components/Screens/Settings/Settings';
import {twitarrTheme} from './src/styles/Theme';
import {SettingDetail} from './src/components/Screens/Settings/SettingDetail';
import {NotificationSettings} from './src/components/Screens/Settings/NotificationSettings';
import {NetworkInfoSettings} from './src/components/Screens/Settings/NetworkInfoSettings';
import {AccountSettings} from './src/components/Screens/Settings/AccountSettings';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {apiQueryV3, setupAxiosStuff} from './src/libraries/APIClient';
import {StorageKeysSettings} from "./src/components/Screens/Settings/StorageKeys";

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
  // Set up the navigation stack.
  const Stack = createNativeStackNavigator();

  setupChannels().catch(error => {
    console.error('Error setting up notification channels:', error);
  });

  // doNetworkInfo();
  initialSettings().catch(error => {
    console.error('Error with settings:', error);
  });

  return (
    <NavigationContainer>
      <PaperProvider theme={twitarrTheme}>
        <QueryClientProvider client={queryClient}>
          <Stack.Navigator>
            <Stack.Screen name={'Home'} component={MainView} />
            <Stack.Screen name={'Settings'} component={SettingsView} />
            <Stack.Screen name={'SettingDetail'} component={SettingDetail} />
            <Stack.Screen name={'NotificationSettings'} component={NotificationSettings} />
            <Stack.Screen name={'NetworkInfoSettings'} component={NetworkInfoSettings} />
            <Stack.Screen name={'StorageKeysSettings'} component={StorageKeysSettings} />
            <Stack.Screen name={'AccountSettings'} component={AccountSettings} />
          </Stack.Navigator>
        </QueryClientProvider>
      </PaperProvider>
    </NavigationContainer>
  );
}

export default App;
