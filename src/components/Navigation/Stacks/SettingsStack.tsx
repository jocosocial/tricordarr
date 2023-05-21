import React from 'react';
import {createNativeStackNavigator, NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SettingDetail} from '../../Screens/Settings/SettingDetail';
import {NetworkInfoSettings} from '../../Screens/Settings/NetworkInfoSettings';
import {StorageKeysSettings} from '../../Screens/Settings/StorageKeys';
import {AccountSettings} from '../../Screens/Settings/Account/AccountSettings';
import {ServerConnectionSettings} from '../../Screens/Settings/ServerConnectionSettings';
import {SettingsView} from '../../Screens/Settings/Settings';
import {TestNotificationScreen} from '../../Screens/Settings/TestNotificationScreen';
import {NavigatorIDs, SettingsStackScreenComponents} from '../../../libraries/Enums/Navigation';
import {TestErrorScreen} from '../../Screens/Settings/TestErrorScreen';
import {useNavigation} from '@react-navigation/native';
import {useStyles} from '../../Context/Contexts/StyleContext';

export type SettingsStackParamList = {
  AccountSettingsScreen: {
    title: string;
  };
  StorageKeysSettingsScreen: undefined;
  SettingsScreen: undefined;
  SettingDetailScreen: {
    settingKey: string;
  };
  NetworkInfoSettingsScreen: undefined;
  ServerConnectionSettingsScreen: undefined;
  TestNotificationScreen: undefined;
  TestErrorScreen: undefined;
};

export const SettingsStack = () => {
  const {screenOptions} = useStyles();
  const Stack = createNativeStackNavigator<SettingsStackParamList>();

  // We don't put the title in the various Screens because we define it in the NavigationListItem
  // so we're always consistent between setting name and header title.
  return (
    <Stack.Navigator
      id={NavigatorIDs.settingsStack}
      initialRouteName={SettingsStackScreenComponents.settings}
      screenOptions={screenOptions}>
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
      <Stack.Screen
        name={SettingsStackScreenComponents.testNotification}
        component={TestNotificationScreen}
        options={{title: 'Test Notification'}}
      />
      <Stack.Screen
        name={SettingsStackScreenComponents.testError}
        component={TestErrorScreen}
        options={{title: 'Test Errors'}}
      />
    </Stack.Navigator>
  );
};

export const useSettingsStack = () => useNavigation<NativeStackNavigationProp<SettingsStackParamList>>();
