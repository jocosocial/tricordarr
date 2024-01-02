import {UserAvatarImage} from '../Images/UserAvatarImage';
import {Menu} from 'react-native-paper';
import React, {useState} from 'react';
import {useUserData} from '../Context/Contexts/UserDataContext';
import {TouchableOpacity} from 'react-native';
import {AppIcons} from '../../libraries/Enums/Icons';
import {
  BottomTabComponents,
  MainStackComponents,
  RootStackComponents,
  SettingsStackScreenComponents,
} from '../../libraries/Enums/Navigation';
import {useRootStack} from '../Navigation/Stacks/RootStackNavigator';
import {useAuth} from '../Context/Contexts/AuthContext';

export const MainAccountMenu = () => {
  const {profilePublicData} = useUserData();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const closeMenu = () => setIsMenuVisible(false);
  const rootNavigation = useRootStack();
  const {isLoggedIn} = useAuth();

  const handleManage = () => {
    closeMenu();
    rootNavigation.push(RootStackComponents.rootContentScreen, {
      screen: BottomTabComponents.homeTab,
      params: {
        screen: MainStackComponents.mainSettingsScreen,
        // initial false needed here to enable the stack to popToTop on bottom button press.
        initial: false,
        params: {
          screen: SettingsStackScreenComponents.accountManagement,
        },
      },
    });
  };

  const handleLogin = () => {
    closeMenu();
    rootNavigation.push(RootStackComponents.rootContentScreen, {
      screen: BottomTabComponents.homeTab,
      params: {
        screen: MainStackComponents.mainSettingsScreen,
        // initial false needed here to enable the stack to popToTop on bottom button press.
        initial: false,
        params: {
          screen: SettingsStackScreenComponents.login,
        },
      },
    });
  };

  const handleHelp = () => {
    closeMenu();
    rootNavigation.push(RootStackComponents.rootContentScreen, {
      screen: BottomTabComponents.homeTab,
      params: {
        screen: MainStackComponents.mainHelpScreen,
        // initial false needed here to enable the stack to popToTop on bottom button press.
        initial: false,
      },
    });
  };

  return (
    <Menu
      visible={isMenuVisible}
      anchor={
        <TouchableOpacity onPress={() => setIsMenuVisible(true)}>
          <UserAvatarImage userHeader={profilePublicData?.header} small={true} />
        </TouchableOpacity>
      }
      onDismiss={closeMenu}>
      {isLoggedIn ? (
        <Menu.Item leadingIcon={AppIcons.user} title={'Manage Account'} onPress={handleManage} />
      ) : (
        <Menu.Item leadingIcon={AppIcons.user} title={'Login'} onPress={handleLogin} />
      )}
      <Menu.Item leadingIcon={AppIcons.help} title={'Help'} onPress={handleHelp} />
    </Menu>
  );
};
