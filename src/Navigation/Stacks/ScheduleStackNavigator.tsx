import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {createStackNavigator, StackNavigationProp} from '@react-navigation/stack';
import React from 'react';

import {useStyles} from '#src/Context/Contexts/StyleContext';
import {CommonScreens, CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';

export type ScheduleStackParamList = CommonStackParamList & {};

export const ScheduleStackNavigator = () => {
  const {screenOptions} = useStyles();
  const Stack = createStackNavigator<ScheduleStackParamList>();

  return (
    <Stack.Navigator
      initialRouteName={CommonStackComponents.scheduleDayScreen}
      screenOptions={{...screenOptions, headerShown: true}}>
      {CommonScreens(Stack)}
    </Stack.Navigator>
  );
};

export const useScheduleStackNavigation = () => useNavigation<StackNavigationProp<ScheduleStackParamList>>();

export const useScheduleStackRoute = () => useRoute<RouteProp<ScheduleStackParamList>>();
