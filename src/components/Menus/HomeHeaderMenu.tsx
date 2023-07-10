import {IconButtonMenu} from './IconButtonMenu';
import {AppIcons} from '../../libraries/Enums/Icons';
import {Menu} from 'react-native-paper';
import React from 'react';
import {useMainStack} from '../Navigation/Stacks/MainStack';
import {
  BottomTabComponents,
  MainStackComponents, SeamailStackScreenComponents,
  SettingsStackScreenComponents,
} from '../../libraries/Enums/Navigation';
import {useBottomTabNavigator} from '../Navigation/Tabs/BottomTabNavigator';
import {useMenu} from '../Context/Contexts/MenuContext';
import {UserAvatarImage} from '../Images/UserAvatarImage';
import {useUserData} from '../Context/Contexts/UserDataContext';

export const HomeHeaderMenu = () => {
  const navigation = useBottomTabNavigator();
  const {closeMenu} = useMenu();
  const {profilePublicData} = useUserData();

  const handleSettings = () => {
    closeMenu();
    navigation.navigate(BottomTabComponents.settingsTab, {
      screen: SettingsStackScreenComponents.settings,
    });
  };

  const handleProfile = () => {
    closeMenu();
    if (profilePublicData) {
      navigation.navigate(BottomTabComponents.seamailTab, {
        screen: SeamailStackScreenComponents.userProfileScreen,
        params: {
          userID: profilePublicData.header.userID,
          username: profilePublicData.header.username,
        },
      });
    }
  };

  return (
    <IconButtonMenu>
      <Menu.Item leadingIcon={AppIcons.user} title={'Profile'} onPress={handleProfile} />
      <Menu.Item leadingIcon={AppIcons.settings} title={'Settings'} onPress={handleSettings} />
    </IconButtonMenu>
  );
};
