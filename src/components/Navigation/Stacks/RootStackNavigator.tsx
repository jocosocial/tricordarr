import React from 'react';
import {createNativeStackNavigator, NativeStackNavigationProp} from '@react-navigation/native-stack';
import {NavigatorScreenParams, useNavigation} from '@react-navigation/native';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {useConfig} from '../../Context/Contexts/ConfigContext';
import {BottomTabNavigator, BottomTabParamList} from '../Tabs/BottomTabNavigator';
import {OobeStackNavigator} from './OobeStackNavigator';

export type RootStackParamList = {
  OobeStackNavigator: undefined;
  RootContentScreen: NavigatorScreenParams<BottomTabParamList>;
};

export enum RootStackComponents {
  oobeNavigator = 'OobeStackNavigator',
  rootContentScreen = 'RootContentScreen',
}

export const RootStackNavigator = () => {
  const {screenOptions} = useStyles();
  const Stack = createNativeStackNavigator<RootStackParamList>();
  const {appConfig} = useConfig();

  let initialRouteName = RootStackComponents.oobeNavigator;
  if (appConfig.oobeCompletedVersion >= appConfig.oobeExpectedVersion) {
    initialRouteName = RootStackComponents.rootContentScreen;
  }

  return (
    <Stack.Navigator initialRouteName={initialRouteName} screenOptions={{...screenOptions, headerShown: false}}>
      <Stack.Screen name={RootStackComponents.oobeNavigator} component={OobeStackNavigator} />
      <Stack.Screen name={RootStackComponents.rootContentScreen} component={BottomTabNavigator} />
    </Stack.Navigator>
  );
};

export const useRootStack = () => useNavigation<NativeStackNavigationProp<RootStackParamList>>();
