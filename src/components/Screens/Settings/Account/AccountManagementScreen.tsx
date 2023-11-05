import React from 'react';
import {List} from 'react-native-paper';
import {useUserData} from '../../../Context/Contexts/UserDataContext';
import {ScrollingContentView} from '../../../Views/Content/ScrollingContentView';
import {AppView} from '../../../Views/AppView';
import {PaddedContentView} from '../../../Views/Content/PaddedContentView';
import {ListSection} from '../../../Lists/ListSection';
import {AppIcons} from '../../../../libraries/Enums/Icons';
import {MinorActionListItem} from '../../../Lists/Items/MinorActionListItem';
import {useSettingsStack} from '../../../Navigation/Stacks/SettingsStack';
import {
  BottomTabComponents,
  SeamailStackScreenComponents,
  SettingsStackScreenComponents,
} from '../../../../libraries/Enums/Navigation';
import {useBottomTabNavigator} from '../../../Navigation/Tabs/BottomTabNavigator';
import {LoadingView} from '../../../Views/Static/LoadingView';
import {useModal} from '../../../Context/Contexts/ModalContext';
import {LogoutDeviceModalView} from '../../../Views/Modals/LogoutModal';

export const AccountManagementScreen = () => {
  const settingsNavigation = useSettingsStack();
  const bottomNav = useBottomTabNavigator();
  const {profilePublicData} = useUserData();
  const {setModalContent, setModalVisible} = useModal();

  const handleLogoutModal = (allDevices = false) => {
    setModalContent(<LogoutDeviceModalView allDevices={allDevices} />);
    setModalVisible(true);
  };

  if (!profilePublicData) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <PaddedContentView padSides={false}>
          <ListSection>
            <MinorActionListItem
              title={'View Profile'}
              icon={AppIcons.user}
              onPress={() =>
                bottomNav.navigate(BottomTabComponents.seamailTab, {
                  screen: SeamailStackScreenComponents.userProfileScreen,
                  params: {
                    userID: profilePublicData.header.userID,
                  },
                })
              }
            />
            <List.Subheader>Manage Your Account</List.Subheader>
            <MinorActionListItem
              title={'Change Username'}
              icon={AppIcons.edituser}
              onPress={() => settingsNavigation.push(SettingsStackScreenComponents.changeUsername)}
            />
            <MinorActionListItem
              title={'Change Password'}
              icon={AppIcons.password}
              onPress={() => settingsNavigation.push(SettingsStackScreenComponents.changePassword)}
            />
            <List.Subheader>Log Out</List.Subheader>
            <MinorActionListItem
              title={'Logout this device'}
              icon={AppIcons.logout}
              onPress={() => handleLogoutModal()}
            />
            <MinorActionListItem
              title={'Logout all devices'}
              icon={AppIcons.error}
              onPress={() => handleLogoutModal(true)}
            />
          </ListSection>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
