import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useTheme} from 'react-native-paper';
import {SeamailsScreen} from '../../Screens/Seamail/Seamails';
import {SeamailScreen} from '../../Screens/Seamail/Seamail';
import {SeamailStackScreenComponents} from '../../../libraries/Enums/Navigation';

export const SeamailStack = () => {
  const Stack = createNativeStackNavigator();
  const theme = useTheme();
  const screenOptions = {
    headerStyle: {
      backgroundColor: theme.colors.background,
    },
    headerTitleStyle: {
      color: theme.colors.onBackground,
    },
    headerTintColor: theme.colors.onBackground,
  };

  return (
    <Stack.Navigator initialRouteName={'SeamailsScreen'} screenOptions={screenOptions}>
      <Stack.Screen
        name={SeamailStackScreenComponents.seamailsScreen}
        component={SeamailsScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name={SeamailStackScreenComponents.seamailScreen}
        component={SeamailScreen}
        options={({route}: {route: any}) => ({title: route.params.title})}
      />
    </Stack.Navigator>
  );
};
