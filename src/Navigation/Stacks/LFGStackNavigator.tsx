import React from 'react';
import {createNativeStackNavigator, NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {useStyles} from '#src/Context/Contexts/StyleContext.ts';
import {LfgJoinedScreen} from '#src/Screens/LFG/LfgJoinedScreen.tsx';
import {LfgFindScreen} from '#src/Screens/LFG/LfgFindScreen.tsx';
import {LfgSettingsScreen} from '#src/Screens/LFG/LfgSettingsScreen.tsx';
import {LfgCreateScreen} from '#src/Screens/LFG/LfgCreateScreen.tsx';
import {SwiftarrFeature} from '../../../Libraries/Enums/AppFeatures.ts';
import {useFeature} from '#src/Context/Contexts/FeatureContext.ts';
import {DisabledView} from '#src/Views/Static/DisabledView.tsx';
import {useConfig} from '#src/Context/Contexts/ConfigContext.ts';
import {CommonScreens, CommonStackParamList} from '#src/Navigation/CommonScreens.tsx';
import {MainStack} from './MainStackNavigator.tsx';
import {LfgOwnedScreen} from '#src/Screens/LFG/LfgOwnedScreen.tsx';
import {LfgFormerScreen} from '#src/Screens/LFG/LfgFormerScreen.tsx';
import {LfgSearchScreen} from '#src/Screens/LFG/LfgSearchScreen.tsx';
import {FezListEndpoints} from '../../../Libraries/Types/index.ts';

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
