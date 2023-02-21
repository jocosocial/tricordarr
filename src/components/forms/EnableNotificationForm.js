import React, {useState, useEffect, useRef} from 'react';
import {AppState, StyleSheet, View} from 'react-native';
import {Button, Text} from 'react-native-paper';
import notifee, {AuthorizationStatus} from '@notifee/react-native';
import {buttonStyles} from '../../styles/Buttons';

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: 20,
    // paddingHorizontal: 20,
  },
});

async function checkNotificationAuthorization() {
  const settings = await notifee.getNotificationSettings();
  // return settings.authorizationStatus;
  if (settings.authorizationStatus === AuthorizationStatus.AUTHORIZED) {
    console.log('Notification permissions has been authorized');
    return true;
  } else if (settings.authorizationStatus === AuthorizationStatus.DENIED) {
    console.log('Notification permissions has been denied');
    return false;
  } else {
    console.error('Unknown notification permissions');
    return false;
  }
}

// @TODO when I take away privileges, it dies.
// https://github.com/flutter/flutter/issues/101813
// https://stackoverflow.com/questions/52480339/activity-restart-every-time-when-disable-permission-from-setting
// its expected.
export const EnableNotificationForm = () => {
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  const [authorized, setAuthorized] = useState(false);

  // https://reactnative.dev/docs/appstate.html
  useEffect(() => {
    // Set the initial state when we load. For some reason this didn't behave well
    // in the useState default above.
    checkNotificationAuthorization().then(isAuthorized => {
      setAuthorized(isAuthorized);
    });

    const subscription = AppState.addEventListener('change', nextAppState => {
      // Transitioning from Background to Foreground. Specifically this means that
      // we are likely returning from the Android permissions dialog.
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        checkNotificationAuthorization().then(isAuthorized => {
          setAuthorized(isAuthorized);
        });
      }
      appState.current = nextAppState;
      setAppStateVisible(appState.current);
    });

    // https://reactjs.org/docs/hooks-effect.html
    return () => {
      subscription.remove();
    };
  }, []);

  let message =
    'Tricorder does not have permission to send you notifications. ' +
    'Tap the button below to enable sending notifications.';
  if (authorized) {
    message =
      'Tricorder has permission to send you notifications. ' +
      'You can change this and other notification settings by tapping the button below.';
  }
  return (
    <View style={styles.container}>
      <Text>{message}</Text>
      <Button style={buttonStyles.setting} mode="contained" onPress={() => notifee.openNotificationSettings()}>
        Open Android Permissions
      </Button>
    </View>
  );
};
