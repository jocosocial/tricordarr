import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {createNativeStackNavigator, NativeStackNavigationProp} from '@react-navigation/native-stack';
import React from 'react';

import {useStyles} from '#src/Context/Contexts/StyleContext';
import {CommonScreens, CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';

export type ScheduleStackParamList = CommonStackParamList & {};

export const ScheduleStackNavigator = () => {
  const {screenOptions} = useStyles();
  const Stack = createNativeStackNavigator<ScheduleStackParamList>();

  return (
    <Stack.Navigator
      initialRouteName={CommonStackComponents.scheduleDayScreen}
      screenOptions={{...screenOptions, headerShown: true}}
    >
      {CommonScreens(Stack)}
    </Stack.Navigator>
  );
};

export const useScheduleStackNavigation = () => useNavigation<NativeStackNavigationProp<ScheduleStackParamList>>();

export const useScheduleStackRoute = () => useRoute<RouteProp<ScheduleStackParamList>>();
