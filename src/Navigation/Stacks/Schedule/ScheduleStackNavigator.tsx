import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';

import {useStyles} from '#src/Context/Contexts/StyleContext';
import {CommonScreens} from '#src/Navigation/Stacks/Common/CommonScreens';
import {CommonStackComponents} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {ScheduleStackParamList} from '#src/Navigation/Stacks/Schedule/ScheduleStackComponents';

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
