import {NavigatorScreenParams, useNavigation} from '@react-navigation/native';
import {createStackNavigator, StackNavigationProp} from '@react-navigation/stack';
import React, {useEffect, useRef} from 'react';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useErrorHandler} from '#src/Context/Contexts/ErrorHandlerContext';
import {useLayout} from '#src/Context/Contexts/LayoutContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {createLogger} from '#src/Libraries/Logger';
import {OobeStackNavigator, OobeStackParamList} from '#src/Navigation/Stacks/OobeStackNavigator';
import {BottomTabNavigator, BottomTabParamList} from '#src/Navigation/Tabs/BottomTabNavigator';
import {LighterScreen} from '#src/Screens/Main/LighterScreen';
import {OobeTitleScreen} from '#src/Screens/OOBE/OobeTitleScreen';

const logger = createLogger('RootStackNavigator.tsx');

export type RootStackParamList = {
  OobeStackNavigator: NavigatorScreenParams<OobeStackParamList>;
  RootContentScreen: NavigatorScreenParams<BottomTabParamList>;
  // Lighter has to be here until I can figure out how to fullscreen a video
  LighterScreen: undefined;
  OobeTitleScreen: undefined;
};

export enum RootStackComponents {
  oobeNavigator = 'OobeStackNavigator',
  rootContentScreen = 'RootContentScreen',
  lighterScreen = 'LighterScreen',
  oobeTitleScreen = 'OobeTitleScreen',
}

export const RootStackNavigator = () => {
  const {screenOptions} = useStyles();
  const Stack = createStackNavigator<RootStackParamList>();
  const {appConfig} = useConfig();
  const {currentSession, isLoading} = useSession();
  const {setHasUnsavedWork} = useErrorHandler();
  const {setSnackbarPayload} = useSnackbar();
  const {footerHeight} = useLayout();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  // Store the last known footer height so we can restore it when navigating back
  const lastKnownFooterHeightRef = useRef<number>(0);

  // Clear or restore footerHeight based on current route
  useEffect(() => {
    const unsubscribe = navigation.addListener('state', () => {
      const state = navigation.getState();
      const currentRoute = state?.routes[state.index];
      if (currentRoute?.name !== RootStackComponents.rootContentScreen) {
        // Navigating away - save current height and clear it
        if (footerHeight.value > 0) {
          lastKnownFooterHeightRef.current = footerHeight.value;
          logger.debug('Saving footerHeight', lastKnownFooterHeightRef.current);
        }
        logger.debug('Navigating away from RootContentScreen, clearing footerHeight');
        footerHeight.set(0);
      } else {
        // Navigating back to RootContentScreen - restore height
        if (lastKnownFooterHeightRef.current > 0) {
          logger.debug('Restoring footerHeight to', lastKnownFooterHeightRef.current);
          footerHeight.set(lastKnownFooterHeightRef.current);
        }
      }
    });

    return unsubscribe;
  }, [navigation, footerHeight]);

  // Wait for session loading to complete before deciding initial route
  if (isLoading) {
    return null;
  }

  let initialRouteName = RootStackComponents.oobeNavigator;
  if ((currentSession?.oobeCompletedVersion ?? 0) >= appConfig.oobeExpectedVersion) {
    initialRouteName = RootStackComponents.rootContentScreen;
  }

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{...screenOptions, headerShown: false}}
      screenListeners={{
        state: () => {
          logger.debug('navigation state change handler.');
          setHasUnsavedWork(false);
          setSnackbarPayload(undefined);
        },
      }}>
      <Stack.Screen name={RootStackComponents.oobeNavigator} component={OobeStackNavigator} />
      <Stack.Screen name={RootStackComponents.rootContentScreen} component={BottomTabNavigator} />
      <Stack.Screen name={RootStackComponents.lighterScreen} component={LighterScreen} />
      <Stack.Screen
        name={RootStackComponents.oobeTitleScreen}
        component={OobeTitleScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};

export const useRootStack = () => useNavigation<StackNavigationProp<RootStackParamList>>();
