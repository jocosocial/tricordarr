import {UserAvatarImage} from '../Images/UserAvatarImage';
import {Divider, Menu} from 'react-native-paper';
import React, {useState} from 'react';
import {useUserData} from '../Context/Contexts/UserDataContext';
import {TouchableOpacity} from 'react-native';
import {AppIcons} from '../../libraries/Enums/Icons';
import {SettingsStackScreenComponents} from '../../libraries/Enums/Navigation';
import {useAuth} from '../Context/Contexts/AuthContext';
import {MainStackComponents, useMainStack} from '../Navigation/Stacks/MainStackNavigator';
import {CommonStackComponents} from '../Navigation/CommonScreens';

export const MainAccountMenu = () => {
  const {profilePublicData} = useUserData();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const closeMenu = () => setIsMenuVisible(false);
  const mainNavigation = useMainStack();
  const {isLoggedIn} = useAuth();

  const handleManage = () => {
    closeMenu();
    mainNavigation.push(MainStackComponents.mainSettingsScreen, {
      screen: SettingsStackScreenComponents.accountManagement,
    });
  };

  const handleProfile = () => {
    closeMenu();
    if (profilePublicData) {
      mainNavigation.push(CommonStackComponents.userProfileScreen, {
        userID: profilePublicData.header.userID,
      });
    }
  };

  const handleSettings = () => {
    closeMenu();
    mainNavigation.push(MainStackComponents.mainSettingsScreen, {
      screen: SettingsStackScreenComponents.settings,
    });
  };

  const handleLogin = () => {
    closeMenu();
    mainNavigation.push(MainStackComponents.mainSettingsScreen, {
      screen: SettingsStackScreenComponents.login,
    });
  };

  const handleHelp = () => {
    closeMenu();
    mainNavigation.push(MainStackComponents.mainHelpScreen);
  };

  const getAvatarImage = () => <UserAvatarImage userHeader={profilePublicData?.header} small={true} />;

  return (
    <Menu
      visible={isMenuVisible}
      anchor={<TouchableOpacity onPress={() => setIsMenuVisible(true)}>{getAvatarImage()}</TouchableOpacity>}
      onDismiss={closeMenu}>
      {isLoggedIn && profilePublicData ? (
        <>
          <Menu.Item leadingIcon={getAvatarImage} title={`Current User: ${profilePublicData.header.username}`} />
          <Divider bold={true} />
          <Menu.Item leadingIcon={AppIcons.profile} title={'Your Profile'} onPress={handleProfile} />
          <Menu.Item leadingIcon={AppIcons.user} title={'Manage Account'} onPress={handleManage} />
        </>
      ) : (
        <Menu.Item leadingIcon={AppIcons.user} title={'Login'} onPress={handleLogin} />
      )}
      <Divider bold={true} />
      <Menu.Item leadingIcon={AppIcons.settings} title={'Settings'} onPress={handleSettings} />
      <Divider bold={true} />
      <Menu.Item leadingIcon={AppIcons.help} title={'Help'} onPress={handleHelp} />
    </Menu>
  );
};
