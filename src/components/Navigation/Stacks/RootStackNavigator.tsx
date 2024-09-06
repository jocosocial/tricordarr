import React from 'react';
import {createNativeStackNavigator, NativeStackNavigationProp} from '@react-navigation/native-stack';
import {NavigatorScreenParams, useNavigation} from '@react-navigation/native';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {useConfig} from '../../Context/Contexts/ConfigContext';
import {BottomTabNavigator, BottomTabParamList} from '../Tabs/BottomTabNavigator';
import {OobeStackNavigator} from './OobeStackNavigator';
import {LighterScreen} from '../../Screens/Main/LighterScreen';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext.ts';
import {useSelection} from '../../Context/Contexts/SelectionContext.ts';
import {ForumListDataSelectionActions} from '../../Reducers/Forum/ForumListDataSelectionReducer.ts';

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
  const Stack = createNativeStackNavigator<RootStackParamList>();
  const {appConfig} = useConfig();
  const {setHasUnsavedWork} = useErrorHandler();
  const {setEnableSelection, setSelectedItems} = useSelection();

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
          // dispatchSelectedForums({
          //   type: ForumListDataSelectionActions.clear,
          // });
          setSelectedItems([]);
        },
      }}>
      <Stack.Screen name={RootStackComponents.oobeNavigator} component={OobeStackNavigator} />
      <Stack.Screen name={RootStackComponents.rootContentScreen} component={BottomTabNavigator} />
      <Stack.Screen name={RootStackComponents.lighterScreen} component={LighterScreen} />
    </Stack.Navigator>
  );
};

export const useRootStack = () => useNavigation<NativeStackNavigationProp<RootStackParamList>>();
