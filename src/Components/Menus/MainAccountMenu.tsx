import React from 'react';
import {TouchableOpacity} from 'react-native';
import {Divider, Menu} from 'react-native-paper';

import {UserAvatarImage} from '#src/Components/Images/UserAvatarImage';
import {AppHeaderMenu} from '#src/Components/Menus/AppHeaderMenu';
import {useAuth} from '#src/Context/Contexts/AuthContext';
import {AppIcons} from '#src/Enums/Icons';
import {useMenu} from '#src/Hooks/MenuHook';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {MainStackComponents, useMainStack} from '#src/Navigation/Stacks/MainStackNavigator';
import {SettingsStackScreenComponents} from '#src/Navigation/Stacks/SettingsStackNavigator';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries';

export const MainAccountMenu = () => {
  const {data: profilePublicData} = useUserProfileQuery();
  const {visible, openMenu, closeMenu} = useMenu();
  const mainNavigation = useMainStack();
  const {isLoggedIn} = useAuth();

  const handleManage = () => {
    mainNavigation.push(MainStackComponents.mainSettingsScreen, {
      screen: SettingsStackScreenComponents.accountManagement,
    });
  };

  const handleProfile = () => {
    if (profilePublicData) {
      mainNavigation.push(CommonStackComponents.userProfileScreen, {
        userID: profilePublicData.header.userID,
      });
    }
  };

  const handleSettings = () => {
    mainNavigation.push(MainStackComponents.mainSettingsScreen, {
      screen: SettingsStackScreenComponents.settings,
    });
  };

  const handleLogin = () => {
    mainNavigation.push(MainStackComponents.mainSettingsScreen, {
      screen: SettingsStackScreenComponents.login,
    });
  };

  const handleRegister = () => {
    mainNavigation.push(MainStackComponents.mainSettingsScreen, {
      screen: SettingsStackScreenComponents.registerScreen,
    });
  };

  const handleHelp = () => {
    mainNavigation.push(MainStackComponents.mainHelpScreen);
  };

  const getAvatarImage = () => <UserAvatarImage userHeader={profilePublicData?.header} small={true} />;

  return (
    <AppHeaderMenu
      visible={visible}
      anchor={<TouchableOpacity onPress={openMenu}>{getAvatarImage()}</TouchableOpacity>}
      onDismiss={closeMenu}>
      {isLoggedIn && profilePublicData ? (
        <>
          <Menu.Item leadingIcon={getAvatarImage} title={`Current User: ${profilePublicData.header.username}`} />
          <Divider bold={true} />
          <Menu.Item leadingIcon={AppIcons.profile} title={'Your Profile'} onPress={handleProfile} />
          <Menu.Item leadingIcon={AppIcons.user} title={'Manage Account'} onPress={handleManage} />
        </>
      ) : (
        <>
          <Menu.Item leadingIcon={AppIcons.user} title={'Login'} onPress={handleLogin} />
          <Menu.Item leadingIcon={AppIcons.registrationCode} title={'Register'} onPress={handleRegister} />
        </>
      )}
      <Divider bold={true} />
      <Menu.Item leadingIcon={AppIcons.settings} title={'Settings'} onPress={handleSettings} />
      <Divider bold={true} />
      <Menu.Item leadingIcon={AppIcons.help} title={'Help'} onPress={handleHelp} />
    </AppHeaderMenu>
  );
};
