import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {createStackNavigator, StackNavigationProp} from '@react-navigation/stack';
import React from 'react';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {CommonScreens, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {LfgCreateScreen} from '#src/Screens/LFG/LfgCreateScreen';
import {LfgFindScreen} from '#src/Screens/LFG/LfgFindScreen';
import {LfgFormerScreen} from '#src/Screens/LFG/LfgFormerScreen';
import {LfgJoinedScreen} from '#src/Screens/LFG/LfgJoinedScreen';
import {LfgOwnedScreen} from '#src/Screens/LFG/LfgOwnedScreen';
import {LfgSearchScreen} from '#src/Screens/LFG/LfgSearchScreen';
import {LfgSettingsScreen} from '#src/Screens/LFG/LfgSettingsScreen';
import {FezListEndpoints} from '#src/Types';

export type LfgStackParamList = CommonStackParamList & {
  LfgJoinedScreen: {
    onlyNew?: boolean;
  };
  LfgFindScreen: undefined;
  LfgOwnedScreen: undefined;
  LfgSettingsScreen: undefined;
  LfgCreateScreen: undefined;
  LfgFormerScreen: undefined;
  LfgSearchScreen: {
    endpoint: FezListEndpoints;
  };
};

export enum LfgStackComponents {
  lfgOwnedScreen = 'LfgOwnedScreen',
  lfgJoinedScreen = 'LfgJoinedScreen',
  lfgFindScreen = 'LfgFindScreen',
  lfgSettingsScreen = 'LfgSettingsScreen',
  lfgCreateScreen = 'LfgCreateScreen',
  lfgFormerScreen = 'LfgFormerScreen',
  lfgSearchScreen = 'LfgSearchScreen',
}

export const LfgStackNavigator = () => {
  const {screenOptions} = useStyles();
  const Stack = createStackNavigator<LfgStackParamList>();
  const {appConfig} = useConfig();

  return (
    <Stack.Navigator
      initialRouteName={appConfig.schedule.defaultLfgScreen}
      screenOptions={{...screenOptions, headerShown: true}}>
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
      <Stack.Screen
        name={LfgStackComponents.lfgOwnedScreen}
        component={LfgOwnedScreen}
        options={{title: 'Your Groups'}}
      />
      <Stack.Screen
        name={LfgStackComponents.lfgSettingsScreen}
        component={LfgSettingsScreen}
        options={{title: 'LFG Settings'}}
      />
      <Stack.Screen
        name={LfgStackComponents.lfgCreateScreen}
        component={LfgCreateScreen}
        options={{title: 'New LFG'}}
      />
      <Stack.Screen
        name={LfgStackComponents.lfgFormerScreen}
        component={LfgFormerScreen}
        options={{title: 'Former Groups'}}
      />
      <Stack.Screen
        name={LfgStackComponents.lfgSearchScreen}
        component={LfgSearchScreen}
        options={{title: 'Search LFGs'}}
      />
      {CommonScreens(Stack)}
    </Stack.Navigator>
  );
};

export const useLFGStackNavigation = () => useNavigation<StackNavigationProp<LfgStackParamList>>();

export const useLFGStackRoute = () => useRoute<RouteProp<LfgStackParamList>>();
