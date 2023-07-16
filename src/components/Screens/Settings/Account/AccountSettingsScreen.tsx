import React from 'react';
import {LoginScreen} from './LoginScreen';
import {AccountManagementScreen} from './AccountManagementScreen';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {NavigatorIDs, SettingsStackScreenComponents} from '../../../../libraries/Enums/Navigation';
import {SettingsStackParamList} from '../../../Navigation/Stacks/SettingsStack';
import {useAuth} from '../../../Context/Contexts/AuthContext';

type Props = NativeStackScreenProps<
  SettingsStackParamList,
  SettingsStackScreenComponents.accountSettings,
  NavigatorIDs.settingsStack
>;

/**
 * Base screen for managing the user account. This returns a different view based on whether
 * the user is logged in or not. The useEffect with title setting is to rapidly set the header
 * title based on the conditions given by the navigation.
 */
export const AccountSettingsScreen = ({route, navigation}: Props) => {
  const {tokenData} = useAuth();

  if (tokenData) {
    return <AccountManagementScreen />;
  }
  return <LoginScreen />;
};
