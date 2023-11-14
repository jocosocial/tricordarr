import React from 'react';
import {createNativeStackNavigator, NativeStackNavigationProp} from '@react-navigation/native-stack';
import {EventStackComponents} from '../../../libraries/Enums/Navigation';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {ScheduleDayScreen} from '../../Screens/Schedule/ScheduleDayScreen';
import {useDrawer} from '../../Context/Contexts/DrawerContext';
import {useCruise} from '../../Context/Contexts/CruiseContext';
import {ScheduleEventSearchScreen} from '../../Screens/Schedule/Event/ScheduleEventSearchScreen';
import {ScheduleSettingsScreen} from '../../Screens/Schedule/ScheduleSettingsScreen';
import {ScheduleEventScreen} from '../../Screens/Schedule/Event/ScheduleEventScreen';
import {EventHelpScreen} from '../../Screens/Schedule/Event/EventHelpScreen';

export type EventStackParamList = {
  ScheduleDayScreen: {
    cruiseDay: number;
  };
  ScheduleEventSearchScreen: undefined;
  ScheduleSettingsScreen: undefined;
  ScheduleEventScreen: {
    eventID: string;
  };
  EventHelpScreen: undefined;
};

export const EventStackNavigator = () => {
  const {screenOptions} = useStyles();
  const Stack = createNativeStackNavigator<EventStackParamList>();
  const {getLeftMainHeaderButtons} = useDrawer();
  const {cruiseDayToday} = useCruise();

  return (
    <Stack.Navigator
      initialRouteName={EventStackComponents.scheduleDayScreen}
      screenOptions={{...screenOptions, headerShown: true}}>
      <Stack.Screen
        name={EventStackComponents.scheduleDayScreen}
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
        name={EventStackComponents.scheduleEventSearchScreen}
        component={ScheduleEventSearchScreen}
        options={{title: 'Search Events'}}
      />
      <Stack.Screen
        name={EventStackComponents.scheduleSettingsScreen}
        component={ScheduleSettingsScreen}
        options={{title: 'Schedule Settings'}}
      />
      <Stack.Screen
        name={EventStackComponents.scheduleEventScreen}
        component={ScheduleEventScreen}
        options={{title: 'Event'}}
      />
      <Stack.Screen
        name={EventStackComponents.eventHelpScreen}
        component={EventHelpScreen}
        options={{title: 'Event Help'}}
      />
    </Stack.Navigator>
  );
};

export const useScheduleStack = () => useNavigation<NativeStackNavigationProp<EventStackParamList>>();

export const useScheduleStackRoute = () => useRoute<RouteProp<EventStackParamList>>();
