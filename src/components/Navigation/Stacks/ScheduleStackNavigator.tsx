import React from 'react';
import {createNativeStackNavigator, NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ScheduleStackComponents} from '../../../libraries/Enums/Navigation';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {ScheduleDayScreen} from '../../Screens/Schedule/ScheduleDayScreen';
import {useDrawer} from '../../Context/Contexts/DrawerContext';
import {useCruise} from '../../Context/Contexts/CruiseContext';
import {ScheduleEventSearchScreen} from '../../Screens/Schedule/ScheduleEventSearchScreen';
import {ScheduleSettingsScreen} from '../../Screens/Schedule/ScheduleSettingsScreen';
import {LfgOwnedScreen} from '../../Screens/Schedule/LfgOwnedScreen';
import {LfgHelpScreen} from '../../Screens/Schedule/LfgHelpScreen';
import {LfgJoinedScreen} from '../../Screens/Schedule/LfgJoinedScreen';
import {LfgFindScreen} from '../../Screens/Schedule/LfgFindScreen';
import {ScheduleEventScreen} from '../../Screens/Schedule/ScheduleEventScreen';
import {LfgScreen} from '../../Screens/Schedule/LfgScreen';
import {LfgParticipationScreen} from '../../Screens/Schedule/LfgParticipationScreen';
import {LfgAddParticipantScreen} from '../../Screens/Schedule/LfgAddParticipantScreen';
import {LfgChatScreen} from '../../Screens/Schedule/LfgChatScreen';

export type ScheduleStackParamList = {
  ScheduleDayScreen: {
    cruiseDay: number;
  };
  ScheduleEventSearchScreen: undefined;
  ScheduleSettingsScreen: undefined;
  ScheduleEventScreen: {
    eventID: string;
  };
  LfgOwnedScreen: undefined;
  LfgHelpScreen: undefined;
  LfgJoinedScreen: undefined;
  LfgFindScreen: undefined;
  LfgScreen: {
    fezID: string;
  };
  LfgParticipationScreen: {
    fezID: string;
  };
  LfgAddParticipantScreen: {
    fezID: string;
  };
  LfgChatScreen: {
    fezID: string;
  };
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
      <Stack.Screen
        name={ScheduleStackComponents.scheduleSettingsScreen}
        component={ScheduleSettingsScreen}
        options={{title: 'Schedule Settings'}}
      />
      <Stack.Screen
        name={ScheduleStackComponents.lfgOwnedScreen}
        component={LfgOwnedScreen}
        options={{title: 'Owned Groups'}}
      />
      <Stack.Screen
        name={ScheduleStackComponents.lfgHelpScreen}
        component={LfgHelpScreen}
        options={{title: 'Looking For Group FAQ'}}
      />
      <Stack.Screen
        name={ScheduleStackComponents.lfgJoinedScreen}
        component={LfgJoinedScreen}
        options={{title: 'Joined Groups'}}
      />
      <Stack.Screen
        name={ScheduleStackComponents.lfgFindScreen}
        component={LfgFindScreen}
        options={{title: 'Find Groups'}}
      />
      <Stack.Screen
        name={ScheduleStackComponents.scheduleEventScreen}
        component={ScheduleEventScreen}
        options={{title: 'Event'}}
      />
      <Stack.Screen
        name={ScheduleStackComponents.lfgScreen}
        component={LfgScreen}
        options={{title: 'Looking For Group'}}
      />
      <Stack.Screen
        name={ScheduleStackComponents.lfgParticipationScreen}
        component={LfgParticipationScreen}
        options={{title: 'Participation'}}
      />
      <Stack.Screen
        name={ScheduleStackComponents.lfgAddParticipantScreen}
        component={LfgAddParticipantScreen}
        options={{title: 'Add Participant'}}
      />
      <Stack.Screen
        name={ScheduleStackComponents.lfgChatScreen}
        component={LfgChatScreen}
        options={{title: 'LFG Chat'}}
      />
    </Stack.Navigator>
  );
};

export const useScheduleStack = () => useNavigation<NativeStackNavigationProp<ScheduleStackParamList>>();

export const useScheduleStackRoute = () => useRoute<RouteProp<ScheduleStackParamList>>();
