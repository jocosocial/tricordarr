/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';

// import {NavigationContainer} from '@react-navigation/native';
// import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {LoginView} from './src/components/views/Login';
// import {Provider as PaperProvider} from 'react-native-paper';
// import {ExampleAppView} from "./src/components/views/Example";

function App(): JSX.Element {
  // console.log('Doing the thing with the stacks and stuff');
  // const Stack = createNativeStackNavigator();

  return (
    <LoginView />
  );
}

export default App;
