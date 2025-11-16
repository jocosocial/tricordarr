import {NavigatorScreenParams, useNavigation} from '@react-navigation/native';
import {createStackNavigator, StackNavigationProp} from '@react-navigation/stack';
import React from 'react';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useErrorHandler} from '#src/Context/Contexts/ErrorHandlerContext';
import {useSelection} from '#src/Context/Contexts/SelectionContext';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {OobeStackNavigator} from '#src/Navigation/Stacks/OobeStackNavigator';
import {BottomTabNavigator, BottomTabParamList} from '#src/Navigation/Tabs/BottomTabNavigator';
import {ForumListDataSelectionActions} from '#src/Reducers/Forum/ForumListDataSelectionReducer';
import {LighterScreen} from '#src/Screens/Main/LighterScreen';

export type RootStackParamList = {
  OobeStackNavigator: undefined;
  RootContentScreen: NavigatorScreenParams<BottomTabParamList>;
  // Lighter has to be here until I can figure out how to fullscreen a video
  LighterScreen: undefined;
};

export enum RootStackComponents {
  oobeNavigator = 'OobeStackNavigator',
  rootContentScreen = 'RootContentScreen',
  lighterScreen = 'LighterScreen',
}

export const RootStackNavigator = () => {
  const {screenOptions} = useStyles();
  const Stack = createStackNavigator<RootStackParamList>();
  const {appConfig} = useConfig();
  const {setHasUnsavedWork} = useErrorHandler();
  const {setEnableSelection, dispatchSelectedForums} = useSelection();
  const {setSnackbarPayload} = useSnackbar();

  let initialRouteName = RootStackComponents.oobeNavigator;
  if (appConfig.oobeCompletedVersion >= appConfig.oobeExpectedVersion) {
    initialRouteName = RootStackComponents.rootContentScreen;
  }

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{...screenOptions, headerShown: false}}
      screenListeners={{
        state: () => {
          console.log('[RootStackNavigator.tsx] navigation state change handler.');
          setHasUnsavedWork(false);
          setEnableSelection(false);
          dispatchSelectedForums({
            type: ForumListDataSelectionActions.clear,
          });
          setSnackbarPayload(undefined);
        },
      }}>
      <Stack.Screen name={RootStackComponents.oobeNavigator} component={OobeStackNavigator} />
      <Stack.Screen name={RootStackComponents.rootContentScreen} component={BottomTabNavigator} />
      <Stack.Screen name={RootStackComponents.lighterScreen} component={LighterScreen} />
    </Stack.Navigator>
  );
};

export const useRootStack = () => useNavigation<StackNavigationProp<RootStackParamList>>();
