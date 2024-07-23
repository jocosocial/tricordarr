import React, {useEffect} from 'react';
import {createNativeStackNavigator, NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {LfgHelpScreen} from '../../Screens/LFG/LfgHelpScreen';
import {LfgJoinedScreen} from '../../Screens/LFG/LfgJoinedScreen';
import {LfgFindScreen} from '../../Screens/LFG/LfgFindScreen';
import {LfgStackComponents} from '../../../libraries/Enums/Navigation';
import {LfgSettingsScreen} from '../../Screens/LFG/LfgSettingsScreen';
import {LfgCreateScreen} from '../../Screens/LFG/LfgCreateScreen';
import {SwiftarrFeature} from '../../../libraries/Enums/AppFeatures';
import {useFeature} from '../../Context/Contexts/FeatureContext';
import {DisabledView} from '../../Views/Static/DisabledView';
import {useConfig} from '../../Context/Contexts/ConfigContext';
import {CommonScreens, CommonStackParamList} from '../CommonScreens';
import {MainStack} from './MainStackNavigator';
import {LfgOwnedScreen} from '../../Screens/LFG/LfgOwnedScreen';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext.ts';

export type LfgStackParamList = CommonStackParamList & {
  LfgHelpScreen: undefined;
  LfgJoinedScreen: undefined;
  LfgFindScreen: undefined;
  LfgOwnedScreen: undefined;
  LfgSettingsScreen: undefined;
  LfgCreateScreen: undefined;
};

export const LfgStackNavigator = () => {
  const {screenOptions} = useStyles();
  const Stack = createNativeStackNavigator<LfgStackParamList>();
  const {getIsDisabled} = useFeature();
  const isDisabled = getIsDisabled(SwiftarrFeature.friendlyfez);
  const {appConfig} = useConfig();
  const {setHasUnsavedWork} = useErrorHandler();

  return (
    <Stack.Navigator
      initialRouteName={appConfig.schedule.defaultLfgScreen}
      screenOptions={{...screenOptions, headerShown: true}}
      screenListeners={{
        state: () => {
          console.log('[LFGStackNavigator.tsx] Clearing unsaved work.');
          setHasUnsavedWork(false);
        },
      }}>
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
      {CommonScreens(Stack as typeof MainStack)}
    </Stack.Navigator>
  );
};

export const useLFGStackNavigation = () => useNavigation<NativeStackNavigationProp<LfgStackParamList>>();

export const useLFGStackRoute = () => useRoute<RouteProp<LfgStackParamList>>();
