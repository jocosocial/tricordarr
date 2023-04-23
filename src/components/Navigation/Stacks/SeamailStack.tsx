import React from 'react';
import {createNativeStackNavigator, NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from 'react-native-paper';
import {SeamailListScreen} from '../../Screens/Seamail/SeamailListScreen';
import {SeamailScreen} from '../../Screens/Seamail/SeamailScreen';
import {SeamailStackScreenComponents} from '../../../libraries/Enums/Navigation';
import {SeamailDetailsScreen} from '../../Screens/Seamail/SeamailDetailsScreen';
import {UserProfileScreen} from '../../Screens/User/UserProfileScreen';
import {useNavigation} from '@react-navigation/native';
import {SeamailCreateScreen} from '../../Screens/Seamail/SeamailCreateScreen';

// Beware: https://github.com/react-navigation/react-navigation/issues/10802
export type SeamailStackParamList = {
  SeamailListScreen: undefined;
  SeamailScreen: {
    fezID: string;
    title: string;
  };
  SeamailDetailsScreen: {
    fezID: string;
  };
  UserProfileScreen: {
    userID: string;
    username: string;
  };
  SeamailCreateScreen: undefined;
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
    <Stack.Navigator initialRouteName={SeamailStackScreenComponents.seamailListScreen} screenOptions={screenOptions}>
      <Stack.Screen
        name={SeamailStackScreenComponents.seamailListScreen}
        component={SeamailListScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name={SeamailStackScreenComponents.seamailScreen}
        component={SeamailScreen}
        options={({route}) => ({title: route.params.title})}
      />
      <Stack.Screen
        name={SeamailStackScreenComponents.seamailDetailsScreen}
        component={SeamailDetailsScreen}
        options={() => ({title: 'Seamail Details'})}
      />
      <Stack.Screen
        name={SeamailStackScreenComponents.userProfileScreen}
        component={UserProfileScreen}
        options={({route}) => ({title: route.params.username})}
      />
      <Stack.Screen
        name={SeamailStackScreenComponents.seamailCreateScreen}
        component={SeamailCreateScreen}
        options={{title: 'New Seamail'}}
      />
    </Stack.Navigator>
  );
};

export const useSeamailStack = () => useNavigation<NativeStackNavigationProp<SeamailStackParamList>>();
