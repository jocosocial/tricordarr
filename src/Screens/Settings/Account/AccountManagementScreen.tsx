import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';

import {MinorActionListItem} from '#src/Components/Lists/Items/MinorActionListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {LogoutDeviceModalView} from '#src/Components/Views/Modals/LogoutModal';
import {NotLoggedInView} from '#src/Components/Views/Static/NotLoggedInView';
import {useModal} from '#src/Context/Contexts/ModalContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {
  SettingsStackParamList,
  SettingsStackScreenComponents,
  useSettingsStack,
} from '#src/Navigation/Stacks/SettingsStackNavigator';
type Props = StackScreenProps<SettingsStackParamList, SettingsStackScreenComponents.accountManagement>;
export const AccountManagementScreen = ({navigation}: Props) => {
  const settingsNavigation = useSettingsStack();
  const {isLoggedIn, currentUserID} = useSession();
  const {setModalContent, setModalVisible} = useModal();

  const handleLogoutModal = (allDevices = false) => {
    setModalContent(<LogoutDeviceModalView allDevices={allDevices} />);
    setModalVisible(true);
  };

  if (!isLoggedIn) {
    return <NotLoggedInView />;
  }

  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <PaddedContentView padSides={false}>
          {currentUserID != null && (
            <>
              <ListSection>
                <ListSubheader>Manage Your Account</ListSubheader>
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
                <MinorActionListItem
                  title={'Create Alt Account'}
                  icon={AppIcons.altAccount}
                  onPress={() =>
                    navigation.push(CommonStackComponents.siteUIScreen, {
                      resource: 'createAltAccount',
                    })
                  }
                />
              </ListSection>
              <ListSection>
                <ListSubheader>User Information</ListSubheader>
                <MinorActionListItem
                  title={'Account Info'}
                  icon={AppIcons.info}
                  onPress={() => settingsNavigation.push(SettingsStackScreenComponents.accountInfoSettingsScreen)}
                />
              </ListSection>
            </>
          )}
          <ListSection>
            <ListSubheader>Log Out</ListSubheader>
            <MinorActionListItem
              title={'Logout this device'}
              icon={AppIcons.logout}
              onPress={() => handleLogoutModal()}
            />
            {currentUserID != null && (
              <MinorActionListItem
                title={'Logout all devices'}
                icon={AppIcons.error}
                onPress={() => handleLogoutModal(true)}
              />
            )}
          </ListSection>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
