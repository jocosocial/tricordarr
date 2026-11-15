import React, {useState} from 'react';
import {TouchableOpacity} from 'react-native';
import {Divider, Menu} from 'react-native-paper';

import {AvatarImage} from '#src/Components/Images/AvatarImage';
import {AppMenu} from '#src/Components/Menus/AppMenu';
import {AccountSwitcherSheet} from '#src/Components/Sheets/AccountSwitcherSheet';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {AppIcons} from '#src/Enums/Icons';
import {useMenu} from '#src/Hooks/useMenu';
import {CommonStackComponents} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {MainStackComponents, useMainStack} from '#src/Navigation/Stacks/Main/MainStackComponents';
import {SettingsStackScreenComponents} from '#src/Navigation/Stacks/Settings/SettingsStackComponents';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries';

export const MainAccountMenu = () => {
  const {data: profilePublicData} = useUserProfileQuery();
  const {visible, openMenu, closeMenu} = useMenu();
  const mainNavigation = useMainStack();
  const {isLoggedIn, accounts} = useSession();
  const [switcherOpen, setSwitcherOpen] = useState(false);

  const handleManage = () => {
    mainNavigation.push(MainStackComponents.mainSettingsScreen, {
      screen: SettingsStackScreenComponents.accountManagement,
    });
  };

  const handleProfile = () => {
    mainNavigation.push(CommonStackComponents.userSelfProfileScreen);
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

  const handleSwitchAccount = () => {
    closeMenu();
    setSwitcherOpen(true);
  };

  const handleHelp = () => {
    mainNavigation.push(CommonStackComponents.todayHelpScreen);
  };

  const getAvatarImage = React.useCallback(
    () => <AvatarImage userHeader={profilePublicData?.header} small={true} />,
    [profilePublicData?.header],
  );

  return (
    <>
      <AccountSwitcherSheet isPresented={switcherOpen} onDismiss={() => setSwitcherOpen(false)} />
      <AppMenu
        visible={visible}
        anchor={
          <TouchableOpacity onPress={openMenu} onLongPress={() => setSwitcherOpen(true)}>
            {getAvatarImage()}
          </TouchableOpacity>
        }
        onDismiss={closeMenu}>
        {isLoggedIn ? (
          <>
            <Menu.Item
              leadingIcon={getAvatarImage}
              title={`Current User: ${profilePublicData?.header.username}`}
              titleNumberOfLines={0}
            />
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
        {accounts.length > 0 && (
          <Menu.Item leadingIcon={AppIcons.altAccount} title={'Switch Account'} onPress={handleSwitchAccount} />
        )}
        <Divider bold={true} />
        <Menu.Item leadingIcon={AppIcons.settings} title={'Settings'} onPress={handleSettings} />
        <Divider bold={true} />
        <Menu.Item leadingIcon={AppIcons.help} title={'Help'} onPress={handleHelp} />
      </AppMenu>
    </>
  );
};
