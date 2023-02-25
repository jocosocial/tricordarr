import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SettingDetail} from '../Screens/Settings/SettingDetail';
import {NotificationSettings} from '../Screens/Settings/NotificationSettings';
import {NetworkInfoSettings} from '../Screens/Settings/NetworkInfoSettings';
import {StorageKeysSettings} from '../Screens/Settings/StorageKeys';
import {AccountSettings} from '../Screens/Settings/AccountSettings';
import {ServerConnectionSettings} from '../Screens/Settings/ServerConnectionSettings';
import {SettingsView} from '../Screens/Settings/Settings';
import {TestNotificationScreen} from '../Screens/Settings/TestNotificationScreen';

export const SettingsStack = () => {
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator initialRouteName={'SettingsScreen'}>
      <Stack.Screen name={'SettingsStack'} component={SettingsView} options={{title: 'Settings'}} />
      <Stack.Screen name={'SettingDetailScreen'} component={SettingDetail} />
      <Stack.Screen name={'NotificationSettingsScreen'} component={NotificationSettings} />
      <Stack.Screen name={'NetworkInfoSettingsScreen'} component={NetworkInfoSettings} />
      <Stack.Screen name={'StorageKeysSettingsScreen'} component={StorageKeysSettings} />
      <Stack.Screen name={'AccountSettingsScreen'} component={AccountSettings} />
      <Stack.Screen name={'ServerConnectionSettingsScreen'} component={ServerConnectionSettings} />
      <Stack.Screen name={'TestNotificationScreen'} component={TestNotificationScreen} />
    </Stack.Navigator>
  );
};
