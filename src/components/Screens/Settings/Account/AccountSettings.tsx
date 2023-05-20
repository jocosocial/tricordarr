import React, {useEffect} from 'react';
import {LoginScreen} from './LoginScreen';
import {LogoutScreen} from './LogoutScreen';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {NavigatorIDs, SettingsStackScreenComponents} from '../../../../libraries/Enums/Navigation';
import {SettingsStackParamList} from '../../../Navigation/Stacks/SettingsStack';
import {useAuth} from '../../../Context/Contexts/AuthContext';

type Props = NativeStackScreenProps<
  SettingsStackParamList,
  SettingsStackScreenComponents.accountSettings,
  NavigatorIDs.settingsStack
>;

export const AccountSettings = ({route, navigation}: Props) => {
  const {tokenData} = useAuth();

  useEffect(() => {
    navigation.setOptions({title: route.params.title});
  }, [navigation, route.params.title]);

  if (tokenData) {
    return <LogoutScreen />;
  }
  return <LoginScreen />;
};
