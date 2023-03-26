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
import {NavigatorIDs, SettingsStackScreenComponents} from '../../../libraries/Enums/Navigation';

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

  // We don't put the title in the various Screens because we define it in the NavigationListItem
  // so we're always consistent between setting name and header title.
  return (
    <Stack.Navigator id={NavigatorIDs.settingsStack} initialRouteName={'SettingsScreen'} screenOptions={screenOptions}>
      <Stack.Screen
        name={SettingsStackScreenComponents.settings}
        component={SettingsView}
        options={{title: 'Settings'}}
      />
      <Stack.Screen name={SettingsStackScreenComponents.settingDetail} component={SettingDetail} />
      <Stack.Screen name={SettingsStackScreenComponents.networkInfoSettings} component={NetworkInfoSettings} />
      <Stack.Screen name={SettingsStackScreenComponents.storageKeySettings} component={StorageKeysSettings} />
      <Stack.Screen name={SettingsStackScreenComponents.accountSettings} component={AccountSettings} />
      <Stack.Screen
        name={SettingsStackScreenComponents.serverConnectionSettings}
        component={ServerConnectionSettings}
        options={{title: 'Background Connection'}}
      />
      <Stack.Screen name={SettingsStackScreenComponents.testNotification} component={TestNotificationScreen} />
    </Stack.Navigator>
  );
};
