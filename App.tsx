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
import {ExampleAppView} from './src/components/views/Example';
import {setupChannels} from './src/notifications/Channels';

function App(): JSX.Element {
  // Set up the navigation stack.
  const Stack = createNativeStackNavigator();

  setupChannels().catch(error => {
    console.error('Error setting up notification channels:', error);
  });

  return (
    <NavigationContainer>
      <PaperProvider>
        <Stack.Navigator>
          <Stack.Screen name={'Home'} component={ExampleAppView} />
          <Stack.Screen name={'Login'} component={LoginView} />
        </Stack.Navigator>
      </PaperProvider>
    </NavigationContainer>
  );
}

export default App;
