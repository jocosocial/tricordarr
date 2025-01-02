import React from 'react';
import {createNativeStackNavigator, NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {LfgJoinedScreen} from '../../Screens/LFG/LfgJoinedScreen';
import {LfgFindScreen} from '../../Screens/LFG/LfgFindScreen';
import {LfgSettingsScreen} from '../../Screens/LFG/LfgSettingsScreen';
import {LfgCreateScreen} from '../../Screens/LFG/LfgCreateScreen';
import {SwiftarrFeature} from '../../../libraries/Enums/AppFeatures';
import {useFeature} from '../../Context/Contexts/FeatureContext';
import {DisabledView} from '../../Views/Static/DisabledView';
import {useConfig} from '../../Context/Contexts/ConfigContext';
import {CommonScreens, CommonStackParamList} from '../CommonScreens';
import {MainStack} from './MainStackNavigator';
import {LfgOwnedScreen} from '../../Screens/LFG/LfgOwnedScreen';
import {LfgFormerScreen} from '../../Screens/LFG/LfgFormerScreen.tsx';
import {LfgSearchScreen} from '../../Screens/LFG/LfgSearchScreen.tsx';
import {FezListEndpoints} from '../../../libraries/Types';

export type LfgStackParamList = CommonStackParamList & {
  LfgJoinedScreen: undefined;
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
  const Stack = createNativeStackNavigator<LfgStackParamList>();
  const {getIsDisabled} = useFeature();
  const isDisabled = getIsDisabled(SwiftarrFeature.friendlyfez);
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
        component={isDisabled ? DisabledView : LfgFindScreen}
        options={{title: 'Find Groups'}}
      />
      <Stack.Screen
        name={LfgStackComponents.lfgOwnedScreen}
        component={isDisabled ? DisabledView : LfgOwnedScreen}
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
        component={isDisabled ? DisabledView : LfgFormerScreen}
        options={{title: 'Former Groups'}}
      />
      <Stack.Screen
        name={LfgStackComponents.lfgSearchScreen}
        component={isDisabled ? DisabledView : LfgSearchScreen}
        options={{title: 'Search LFGs'}}
      />
      {CommonScreens(Stack as typeof MainStack)}
    </Stack.Navigator>
  );
};

export const useLFGStackNavigation = () => useNavigation<NativeStackNavigationProp<LfgStackParamList>>();

export const useLFGStackRoute = () => useRoute<RouteProp<LfgStackParamList>>();
