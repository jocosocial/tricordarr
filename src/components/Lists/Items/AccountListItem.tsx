import React, {useEffect, useState} from 'react';
import {List} from 'react-native-paper';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {useSettingsStack} from '../../Navigation/Stacks/SettingsStack';
import {SettingsStackScreenComponents} from '../../../libraries/Enums/Navigation';
import {useAuth} from '../../Context/Contexts/AuthContext';

/**
 * Used in the Settings list for the users current account.
 */
export const AccountListItem = () => {
  const [title, setTitle] = useState('');
  const navigation = useSettingsStack();
  const description = 'Manage your Twitarr account.';
  const {profilePublicData} = useUserData();
  const {tokenData} = useAuth();

  useEffect(() => {
    if (tokenData) {
      if (profilePublicData && !!profilePublicData.header && !!profilePublicData.header.username) {
        setTitle(profilePublicData.header.username);
      } else {
        setTitle('UNKNOWN');
      }
    } else {
      setTitle('Login');
    }
  }, [profilePublicData, tokenData]);

  return (
    <List.Item
      title={title}
      description={description}
      onPress={() => navigation.push(SettingsStackScreenComponents.accountSettings, {title: title})}
    />
  );
};
