import React from 'react';
import {createNativeStackNavigator, NativeStackNavigationProp} from '@react-navigation/native-stack';
import {EventStackComponents} from '../../../libraries/Enums/Navigation';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {EventDayScreen} from '../../Screens/Event/EventDayScreen';
import {useDrawer} from '../../Context/Contexts/DrawerContext';
import {useCruise} from '../../Context/Contexts/CruiseContext';
import {EventSearchScreen} from '../../Screens/Event/EventSearchScreen';
import {EventSettingsScreen} from '../../Screens/Event/EventSettingsScreen';
import {EventScreen} from '../../Screens/Event/EventScreen';
import {EventHelpScreen} from '../../Screens/Event/EventHelpScreen';
import {EventFavoritesScreen} from '../../Screens/Event/EventFavoritesScreen';

export type EventStackParamList = {
  EventDayScreen: {
    cruiseDay: number;
  };
  EventSearchScreen: undefined;
  EventSettingsScreen: undefined;
  EventScreen: {
    eventID: string;
  };
  EventHelpScreen: undefined;
  EventFavoritesScreen: undefined;
};

export const EventStackNavigator = () => {
  const {screenOptions} = useStyles();
  const Stack = createNativeStackNavigator<EventStackParamList>();
  const {getLeftMainHeaderButtons} = useDrawer();
  const {cruiseDayToday} = useCruise();

  return (
    <Stack.Navigator
      initialRouteName={EventStackComponents.eventDayScreen}
      screenOptions={{...screenOptions, headerShown: true}}>
      <Stack.Screen
        name={EventStackComponents.eventDayScreen}
        component={EventDayScreen}
        options={{
          headerLeft: getLeftMainHeaderButtons,
          title: 'Schedule',
        }}
        initialParams={{
          cruiseDay: cruiseDayToday,
        }}
      />
      <Stack.Screen
        name={EventStackComponents.eventSearchScreen}
        component={EventSearchScreen}
        options={{title: 'Search Events'}}
      />
      <Stack.Screen
        name={EventStackComponents.eventSettingsScreen}
        component={EventSettingsScreen}
        options={{title: 'Schedule Settings'}}
      />
      <Stack.Screen name={EventStackComponents.eventScreen} component={EventScreen} options={{title: 'Event'}} />
      <Stack.Screen
        name={EventStackComponents.eventHelpScreen}
        component={EventHelpScreen}
        options={{title: 'Event Help'}}
      />
      <Stack.Screen
        name={EventStackComponents.eventFavoritesScreen}
        component={EventFavoritesScreen}
        options={{title: 'Favorite Events'}}
      />
    </Stack.Navigator>
  );
};

export const useEventStackNavigation = () => useNavigation<NativeStackNavigationProp<EventStackParamList>>();

export const useEventStackRoute = () => useRoute<RouteProp<EventStackParamList>>();
