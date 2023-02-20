/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';

import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {LoginView} from './src/components/views/Login';
import {Provider as PaperProvider} from 'react-native-paper';
import {MainView} from './src/components/views/Main';
import {setupChannels} from './src/notifications/Channels';
import {doNetworkInfo} from './src/libraries/Network';

function App(): JSX.Element {
  // Set up the navigation stack.
  const Stack = createNativeStackNavigator();

  setupChannels().catch(error => {
    console.error('Error setting up notification channels:', error);
  });

  doNetworkInfo();

  return (
    <NavigationContainer>
      <PaperProvider>
        <Stack.Navigator>
          <Stack.Screen name={'Home'} component={MainView} />
          <Stack.Screen name={'Login'} component={LoginView} />
        </Stack.Navigator>
      </PaperProvider>
    </NavigationContainer>
  );
}

export default App;
