import React from 'react';
import {createNativeStackNavigator, NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ScheduleStackComponents} from '../../../libraries/Enums/Navigation';
import {useNavigation} from '@react-navigation/native';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {ScheduleDayScreen} from '../../Screens/Schedule/ScheduleDayScreen';
import {useDrawer} from '../../Context/Contexts/DrawerContext';

export type ScheduleStackParamList = {
  ScheduleDayScreen: {
    cruiseDay?: number;
  };
};

export const ScheduleStackNavigator = () => {
  const {screenOptions} = useStyles();
  const Stack = createNativeStackNavigator<ScheduleStackParamList>();
  const {getLeftMainHeaderButtons} = useDrawer();

  return (
    <Stack.Navigator
      initialRouteName={ScheduleStackComponents.scheduleDayScreen}
      screenOptions={{...screenOptions, headerShown: true}}>
      <Stack.Screen
        name={ScheduleStackComponents.scheduleDayScreen}
        component={ScheduleDayScreen}
        options={{
          headerLeft: getLeftMainHeaderButtons,
          title: 'Schedule',
        }}
      />
    </Stack.Navigator>
  );
};

export const useScheduleStack = () => useNavigation<NativeStackNavigationProp<ScheduleStackParamList>>();
