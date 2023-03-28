import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useTheme} from 'react-native-paper';
import {SeamailsScreen} from '../../Screens/Seamail/Seamails';
import {SeamailScreen} from '../../Screens/Seamail/Seamail';
import {SeamailStackScreenComponents} from '../../../libraries/Enums/Navigation';

// Beware: https://github.com/react-navigation/react-navigation/issues/10802
export type SeamailStackParamList = {
  SeamailsScreen: undefined;
  SeamailScreen: {
    fezID: string;
    title: string;
  };
};

export const SeamailStack = () => {
  const Stack = createNativeStackNavigator<SeamailStackParamList>();
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
    <Stack.Navigator initialRouteName={SeamailStackScreenComponents.seamailsScreen} screenOptions={screenOptions}>
      <Stack.Screen
        name={SeamailStackScreenComponents.seamailsScreen}
        component={SeamailsScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name={SeamailStackScreenComponents.seamailScreen}
        component={SeamailScreen}
        options={({route}) => ({title: route.params.title})}
      />
    </Stack.Navigator>
  );
};
