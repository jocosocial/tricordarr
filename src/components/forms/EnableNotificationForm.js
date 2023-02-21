import React, {useState, useEffect} from 'react';
import {Button, Switch, Text, TouchableRipple, List} from 'react-native-paper';
import {SaveButton} from '../Buttons/SaveButton';
import {StyleSheet, View} from 'react-native';
import {buttonStyles} from '../../styles/Buttons';
import notifee, {EventType, AndroidColor, AuthorizationStatus} from '@notifee/react-native';


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
  // const [authorized, setAuthorized] = useState(checkNotificationAuthorization());

  // useEffect(() => {
  //   checkNotificationAuthorization().then(isAuthorized => {
  //     setAuthorized(isAuthorized);
  //   });
  // }, [authorized]);

  let message = 'Tricorder does not have permission to send you notifications. Tap the button below to enable sending notifications.';
  // if (authorized) {
  //   message = 'Tricorder has permission to send you notifications. You can change this and other notification settings by tapping the button below.';
  // }
  return (
    <View style={styles.container}>
      <Text>{message}</Text>
      <Button style={buttonStyles.setting} mode="contained" onPress={() => notifee.openNotificationSettings()}>
        Open Android Permissions
      </Button>
      {/*<TouchableRipple onPress={() => setValue(!value)}>*/}
      {/*  <View style={styles.row}>*/}
      {/*    <Text>Enable</Text>*/}
      {/*    <Switch value={value} onValueChange={() => setValue(!value)} />*/}
      {/*  </View>*/}
      {/*</TouchableRipple>*/}
      {/*<SaveButton onPress={onSave} />*/}
    </View>
  );
};
