import React from 'react';
import {createNativeStackNavigator, NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {LfgOwnedScreen} from '../../Screens/LFG/LfgOwnedScreen';
import {LfgHelpScreen} from '../../Screens/LFG/LfgHelpScreen';
import {LfgJoinedScreen} from '../../Screens/LFG/LfgJoinedScreen';
import {LfgFindScreen} from '../../Screens/LFG/LfgFindScreen';
import {LfgScreen} from '../../Screens/LFG/LfgScreen';
import {LfgParticipationScreen} from '../../Screens/LFG/LfgParticipationScreen';
import {LfgAddParticipantScreen} from '../../Screens/LFG/LfgAddParticipantScreen';
import {LfgChatScreen} from '../../Screens/LFG/LfgChatScreen';
import {LfgStackComponents} from '../../../libraries/Enums/Navigation';
import {LfgSettingsScreen} from '../../Screens/LFG/LfgSettingsScreen';

export type LfgStackParamList = {
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
  LfgSettingsScreen: undefined;
};

export const LfgStackNavigator = () => {
  const {screenOptions} = useStyles();
  const Stack = createNativeStackNavigator<LfgStackParamList>();

  return (
    <Stack.Navigator
      initialRouteName={LfgStackComponents.lfgFindScreen}
      screenOptions={{...screenOptions, headerShown: true}}>
      <Stack.Screen
        name={LfgStackComponents.lfgOwnedScreen}
        component={LfgOwnedScreen}
        options={{title: 'Owned Groups'}}
      />
      <Stack.Screen
        name={LfgStackComponents.lfgHelpScreen}
        component={LfgHelpScreen}
        options={{title: 'Looking For Group FAQ'}}
      />
      <Stack.Screen
        name={LfgStackComponents.lfgJoinedScreen}
        component={LfgJoinedScreen}
        options={{title: 'Joined Groups'}}
      />
      <Stack.Screen
        name={LfgStackComponents.lfgFindScreen}
        component={LfgFindScreen}
        options={{title: 'Find Groups'}}
      />
      <Stack.Screen name={LfgStackComponents.lfgScreen} component={LfgScreen} options={{title: 'Looking For Group'}} />
      <Stack.Screen
        name={LfgStackComponents.lfgParticipationScreen}
        component={LfgParticipationScreen}
        options={{title: 'Participation'}}
      />
      <Stack.Screen
        name={LfgStackComponents.lfgAddParticipantScreen}
        component={LfgAddParticipantScreen}
        options={{title: 'Add Participant'}}
      />
      <Stack.Screen name={LfgStackComponents.lfgChatScreen} component={LfgChatScreen} options={{title: 'LFG Chat'}} />
      <Stack.Screen
        name={LfgStackComponents.lfgSettingsScreen}
        component={LfgSettingsScreen}
        options={{title: 'LFG Settings'}}
      />
    </Stack.Navigator>
  );
};

export const useLFGStackNavigation = () => useNavigation<NativeStackNavigationProp<LfgStackParamList>>();

export const useLFGStackRoute = () => useRoute<RouteProp<LfgStackParamList>>();
