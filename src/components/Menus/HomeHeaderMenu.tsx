import React from 'react';
import {useMainStack} from '../Navigation/Stacks/MainStack';
import {
  BottomTabComponents,
  MainStackComponents,
  SeamailStackScreenComponents,
  SettingsStackScreenComponents,
} from '../../libraries/Enums/Navigation';
import {useBottomTabNavigator} from '../Navigation/Tabs/BottomTabNavigator';
import {useUserData} from '../Context/Contexts/UserDataContext';
import {AppIcon} from '../Images/AppIcon';
import {HiddenItem, OverflowMenu} from 'react-navigation-header-buttons';
import {AppIcons} from '../../libraries/Enums/Icons';
import {Divider} from 'react-native-paper';

export const HomeHeaderMenu = () => {
  const bottomTabNavigator = useBottomTabNavigator();
  const mainStackNavigator = useMainStack();
  const {profilePublicData} = useUserData();

  const handleSettings = () => {
    mainStackNavigator.push(MainStackComponents.mainSettingsScreen, {
      screen: SettingsStackScreenComponents.settings,
    });
  };

  const handleProfile = () => {
    if (profilePublicData) {
      bottomTabNavigator.navigate(BottomTabComponents.seamailTab, {
        screen: SeamailStackScreenComponents.userProfileScreen,
        params: {
          userID: profilePublicData.header.userID,
          username: profilePublicData.header.username,
        },
      });
    }
  };

  const handleWebUI = () =>
    bottomTabNavigator.navigate(BottomTabComponents.homeTab, {
      screen: MainStackComponents.siteUIScreen,
    });

  const getMenuIcon = () => <AppIcon icon={AppIcons.menu} />;

  return (
    <OverflowMenu OverflowIcon={getMenuIcon}>
      <HiddenItem icon={<AppIcon icon={AppIcons.user} />} title={'Profile'} onPress={handleProfile} />
      <HiddenItem icon={<AppIcon icon={AppIcons.settings} />} title={'Settings'} onPress={handleSettings} />
      <Divider bold={true} />
      <HiddenItem icon={<AppIcon icon={AppIcons.webview} />} title={'Web UI'} onPress={handleWebUI} />
    </OverflowMenu>
  );
};
