import React from 'react';
import {createNativeStackNavigator, NativeStackNavigationProp} from '@react-navigation/native-stack';
import {NetworkInfoSettings} from '../../Screens/Settings/NetworkInfoSettings';
import {AccountSettingsScreen} from '../../Screens/Settings/Account/AccountSettingsScreen';
import {ServerConnectionSettings} from '../../Screens/Settings/ServerConnectionSettings';
import {SettingsScreen} from '../../Screens/Settings/SettingsScreen';
import {TestNotificationScreen} from '../../Screens/Settings/TestNotificationScreen';
import {NavigatorIDs, SettingsStackScreenComponents} from '../../../libraries/Enums/Navigation';
import {TestErrorScreen} from '../../Screens/Settings/TestErrorScreen';
import {useNavigation} from '@react-navigation/native';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {ConfigServerUrlScreen} from '../../Screens/Settings/Config/ConfigServerUrlScreen';
import {ConfigShipSSIDScreen} from '../../Screens/Settings/Config/ConfigShipSSIDScreen';
import {SocketSettingsScreen} from '../../Screens/Settings/SocketSettingsScreen';
import {PushNotificationSettingsScreen} from '../../Screens/Settings/Notifications/PushNotificationSettingsScreen';
import {OobeSettingsScreen} from '../../Screens/Settings/OobeSettingsScreen';
import {ChangeUsernameScreen} from '../../Screens/Settings/Account/ChangeUsernameScreen';
import {ChangePasswordScreen} from '../../Screens/Settings/Account/ChangePasswordScreen';

export type SettingsStackParamList = {
  AccountSettingsScreen: {
    title: string;
  };
  SettingsScreen: undefined;
  NetworkInfoSettingsScreen: undefined;
  ServerConnectionSettingsScreen: undefined;
  TestNotificationScreen: undefined;
  TestErrorScreen: undefined;
  ConfigServerUrlScreen: undefined;
  ConfigShipSSIDScreen: undefined;
  SocketSettingsScreen: undefined;
  PushNotificationSettingsScreen: undefined;
  OobeSettingsScreen: undefined;
  ChangePasswordScreen: undefined;
  ChangeUsernameScreen: undefined;
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
        component={SettingsScreen}
        options={{title: 'Settings'}}
      />
      <Stack.Screen name={SettingsStackScreenComponents.networkInfoSettings} component={NetworkInfoSettings} />
      <Stack.Screen name={SettingsStackScreenComponents.accountSettings} component={AccountSettingsScreen} />
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
      <Stack.Screen
        name={SettingsStackScreenComponents.configServerUrl}
        component={ConfigServerUrlScreen}
        options={{title: 'Server URL'}}
      />
      <Stack.Screen
        name={SettingsStackScreenComponents.configShipSSID}
        component={ConfigShipSSIDScreen}
        options={{title: 'WiFi Network'}}
      />
      <Stack.Screen
        name={SettingsStackScreenComponents.socketSettings}
        component={SocketSettingsScreen}
        options={{title: 'Sockets'}}
      />
      <Stack.Screen
        name={SettingsStackScreenComponents.pushNotificationSettings}
        component={PushNotificationSettingsScreen}
        options={{title: 'Push Notifications'}}
      />
      <Stack.Screen
        name={SettingsStackScreenComponents.oobeSettings}
        component={OobeSettingsScreen}
        options={{title: 'OOBE'}}
      />
      <Stack.Screen
        name={SettingsStackScreenComponents.changeUsername}
        component={ChangeUsernameScreen}
        options={{title: 'Change Username'}}
      />
      <Stack.Screen
        name={SettingsStackScreenComponents.changePassword}
        component={ChangePasswordScreen}
        options={{title: 'Change Password'}}
      />
    </Stack.Navigator>
  );
};

export const useSettingsStack = () => useNavigation<NativeStackNavigationProp<SettingsStackParamList>>();
