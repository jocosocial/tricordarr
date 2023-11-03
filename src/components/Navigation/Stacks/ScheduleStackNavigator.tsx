import React from 'react';
import {createNativeStackNavigator, NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ScheduleStackComponents} from '../../../libraries/Enums/Navigation';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {ScheduleDayScreen} from '../../Screens/Schedule/ScheduleDayScreen';
import {useDrawer} from '../../Context/Contexts/DrawerContext';
import {useCruise} from '../../Context/Contexts/CruiseContext';
import {ScheduleEventSearchScreen} from '../../Screens/Schedule/ScheduleEventSearchScreen';

export type ScheduleStackParamList = {
  ScheduleDayScreen: {
    cruiseDay: number;
  };
  ScheduleEventSearchScreen: undefined;
};

export const ScheduleStackNavigator = () => {
  const {screenOptions} = useStyles();
  const Stack = createNativeStackNavigator<ScheduleStackParamList>();
  const {getLeftMainHeaderButtons} = useDrawer();
  const {cruiseDayToday} = useCruise();

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
        initialParams={{
          cruiseDay: cruiseDayToday,
        }}
      />
      <Stack.Screen
        name={ScheduleStackComponents.scheduleEventSearchScreen}
        component={ScheduleEventSearchScreen}
        options={{title: 'Search Events'}}
      />
    </Stack.Navigator>
  );
};

export const useScheduleStack = () => useNavigation<NativeStackNavigationProp<ScheduleStackParamList>>();
export const useScheduleStackRoute = () => useRoute<RouteProp<ScheduleStackParamList>>();
