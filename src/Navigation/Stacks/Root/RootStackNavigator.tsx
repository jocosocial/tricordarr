import {useNavigation} from '@react-navigation/native';
import {createStackNavigator, StackNavigationProp} from '@react-navigation/stack';
import React, {useEffect, useRef, useState} from 'react';
import {StyleSheet, View} from 'react-native';

import {useErrorHandler} from '#src/Context/Contexts/ErrorHandlerContext';
import {useLayout} from '#src/Context/Contexts/LayoutContext';
import {useOobe} from '#src/Context/Contexts/OobeContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {createLogger} from '#src/Libraries/Logger';
import {consumeStashedNavigationState, navigationRef} from '#src/Libraries/NavigationRef';
import {OobeStackNavigator} from '#src/Navigation/Stacks/Oobe/OobeStackNavigator';
import {RootStackComponents, RootStackParamList} from '#src/Navigation/Stacks/Root/RootStackComponents';
import {BottomTabNavigator} from '#src/Navigation/Tabs/Bottom/BottomTabNavigator';
import {LighterScreen} from '#src/Screens/Main/LighterScreen';

const logger = createLogger('RootStackNavigator.tsx');

const hiddenStyles = StyleSheet.create({
  hidden: {flex: 1, opacity: 0},
  visible: {flex: 1},
});

export const RootStackNavigator = () => {
  const {screenOptions} = useStyles();
  const Stack = createStackNavigator<RootStackParamList>();
  const {oobeCompleted, resumeAfterCommit} = useOobe();
  const {currentSession} = useSession();
  const {setHasUnsavedWork} = useErrorHandler();
  const {setSnackbarPayload} = useSnackbar();
  const {footerHeight} = useLayout();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  // Store the last known footer height so we can restore it when navigating back
  const lastKnownFooterHeightRef = useRef<number>(0);
  // Track the previous root-level route so we only clear the snackbar on root route changes
  const previousRootRouteRef = useRef<string | undefined>(undefined);

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

  // A flow that switched sessions mid-stack (Settings > Server URL) stashed
  // its navigation state before the SessionScope remount reset it. Put it back once the container
  // is ready again. The navigator has to mount first, and would flash the initial route (Today)
  // for a frame, so it stays invisible until the state is restored.
  const [stashed] = useState(() => consumeStashedNavigationState());
  const [restoring, setRestoring] = useState(!!stashed);
  useEffect(() => {
    if (!stashed) {
      return;
    }
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const restore = () => {
      if (navigationRef.isReady()) {
        navigationRef.resetRoot(stashed);
        // Let the restored state render before revealing it.
        timer = setTimeout(() => setRestoring(false), 0);
      } else if (attempts++ < 20) {
        timer = setTimeout(restore, 50);
      } else {
        setRestoring(false);
      }
    };
    restore();
    return () => clearTimeout(timer);
  }, [stashed]);

  // Setup is where a session gets created, so a device with no session goes there even if it
  // completed setup before (every session was removed, or storage was reset). A setup flow that
  // just changed the session (first run, boarding) also comes back here to finish its last steps.
  let initialRouteName = RootStackComponents.oobeNavigator;
  if (oobeCompleted && currentSession && !resumeAfterCommit) {
    initialRouteName = RootStackComponents.rootContentScreen;
  }

  return (
    <View style={restoring ? hiddenStyles.hidden : hiddenStyles.visible}>
      <Stack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{...screenOptions, headerShown: false}}
        screenListeners={{
          state: () => {
            logger.debug('navigation state change handler.');
            setHasUnsavedWork(false);
            // KrakenTalk call declined messages highlighted that this was previously
            // clearing the snackbar too aggressively.
            const state = navigation.getState();
            const currentRootRoute = state?.routes[state.index]?.name;
            if (previousRootRouteRef.current !== undefined && currentRootRoute !== previousRootRouteRef.current) {
              setSnackbarPayload(undefined);
            }
            previousRootRouteRef.current = currentRootRoute;
          },
        }}>
        <Stack.Screen name={RootStackComponents.oobeNavigator} component={OobeStackNavigator} />
        <Stack.Screen name={RootStackComponents.rootContentScreen} component={BottomTabNavigator} />
        <Stack.Screen name={RootStackComponents.lighterScreen} component={LighterScreen} />
      </Stack.Navigator>
    </View>
  );
};
