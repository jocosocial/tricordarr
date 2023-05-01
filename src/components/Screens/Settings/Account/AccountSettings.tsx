import React, {useEffect} from 'react';
import {LoginScreen} from './LoginScreen';
import {LogoutScreen} from './LogoutScreen';
import {useUserData} from '../../../Context/Contexts/UserDataContext';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {NavigatorIDs, SettingsStackScreenComponents} from '../../../../libraries/Enums/Navigation';
import {SettingsStackParamList} from '../../../Navigation/Stacks/SettingsStack';

type Props = NativeStackScreenProps<
  SettingsStackParamList,
  SettingsStackScreenComponents.accountSettings,
  NavigatorIDs.settingsStack
>;

export const AccountSettings = ({route, navigation}: Props) => {
  const {isLoggedIn, isLoading} = useUserData();

  useEffect(() => {
    navigation.setOptions({title: route.params.title});
  }, [navigation, route.params.title]);

  if (!isLoading && isLoggedIn) {
    return <LogoutScreen />;
  } else if (!isLoading && !isLoggedIn) {
    return <LoginScreen />;
  } else {
    return <></>;
  }
};
