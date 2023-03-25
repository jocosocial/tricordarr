import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SettingDetail} from '../../Screens/Settings/SettingDetail';
import {NetworkInfoSettings} from '../../Screens/Settings/NetworkInfoSettings';
import {StorageKeysSettings} from '../../Screens/Settings/StorageKeys';
import {AccountSettings} from '../../Screens/Settings/Account/AccountSettings';
import {ServerConnectionSettings} from '../../Screens/Settings/ServerConnectionSettings';
import {SettingsView} from '../../Screens/Settings/Settings';
import {TestNotificationScreen} from '../../Screens/Settings/TestNotificationScreen';
import {useTheme} from 'react-native-paper';
import {NavigatorIDs, SettingsStackScreenIDs} from '../../../libraries/Enums/Navigation';

export const SettingsStack = () => {
  const Stack = createNativeStackNavigator();
  const theme = useTheme();
  const screenOptions = {
    headerStyle: {
      backgroundColor: theme.colors.background,
    },
    headerTitleStyle: {
      color: theme.colors.onBackground,
    },
    headerTintColor: theme.colors.onBackground,
  };

  return (
    <Stack.Navigator id={NavigatorIDs.settingsStack} initialRouteName={'SettingsScreen'} screenOptions={screenOptions}>
      <Stack.Screen name={SettingsStackScreenIDs.settings} component={SettingsView} options={{title: 'Settings'}} />
      <Stack.Screen name={SettingsStackScreenIDs.settingDetail} component={SettingDetail} />
      <Stack.Screen name={SettingsStackScreenIDs.networkInfoSettings} component={NetworkInfoSettings} />
      <Stack.Screen name={SettingsStackScreenIDs.storageKeySettings} component={StorageKeysSettings} />
      <Stack.Screen name={SettingsStackScreenIDs.accountSettings} component={AccountSettings} />
      <Stack.Screen
        name={SettingsStackScreenIDs.serverConnectionSettings}
        component={ServerConnectionSettings}
        options={{title: 'Background Connection'}}
      />
      <Stack.Screen name={SettingsStackScreenIDs.testNotification} component={TestNotificationScreen} />
    </Stack.Navigator>
  );
};
