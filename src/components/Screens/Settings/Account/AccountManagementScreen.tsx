import React from 'react';
import {useUserData} from '../../../Context/Contexts/UserDataContext';
import {ScrollingContentView} from '../../../Views/Content/ScrollingContentView';
import {AppView} from '../../../Views/AppView';
import {PaddedContentView} from '../../../Views/Content/PaddedContentView';
import {ListSection} from '../../../Lists/ListSection';
import {AppIcons} from '../../../../libraries/Enums/Icons';
import {MinorActionListItem} from '../../../Lists/Items/MinorActionListItem';
import {SettingsStackParamList, useSettingsStack} from '../../../Navigation/Stacks/SettingsStack';
import {SettingsStackScreenComponents} from '../../../../libraries/Enums/Navigation';
import {useModal} from '../../../Context/Contexts/ModalContext';
import {LogoutDeviceModalView} from '../../../Views/Modals/LogoutModal';
import {ListSubheader} from '../../../Lists/ListSubheader';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {CommonStackComponents} from '../../../Navigation/CommonScreens';

type Props = NativeStackScreenProps<SettingsStackParamList, SettingsStackScreenComponents.accountManagement>;
export const AccountManagementScreen = ({navigation}: Props) => {
  const settingsNavigation = useSettingsStack();
  const {profilePublicData} = useUserData();
  const {setModalContent, setModalVisible} = useModal();

  const handleLogoutModal = (allDevices = false) => {
    setModalContent(<LogoutDeviceModalView allDevices={allDevices} />);
    setModalVisible(true);
  };

  // Need to conditional on ProfilePublicData in case it never loaded because the user lost communication
  // with the server. Logout device should still be allowed when no local data because it clears state.
  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <PaddedContentView padSides={false}>
          {profilePublicData && (
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
                onPress={() => navigation.push(CommonStackComponents.siteUIScreen, {
                  resource: 'createAltAccount',
                })}
              />
            </ListSection>
          )}
          <ListSection>
            <ListSubheader>Log Out</ListSubheader>
            <MinorActionListItem
              title={'Logout this device'}
              icon={AppIcons.logout}
              onPress={() => handleLogoutModal()}
            />
            {profilePublicData && (
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
