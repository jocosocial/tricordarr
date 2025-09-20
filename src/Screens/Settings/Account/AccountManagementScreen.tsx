import React from 'react';
import {ScrollingContentView} from '../../../Views/Content/ScrollingContentView.tsx';
import {AppView} from '../../../Views/AppView.tsx';
import {PaddedContentView} from '../../../Views/Content/PaddedContentView.tsx';
import {ListSection} from '../../../Lists/ListSection.tsx';
import {AppIcons} from '../../../../Libraries/Enums/Icons.ts';
import {MinorActionListItem} from '../../../Lists/Items/MinorActionListItem.tsx';
import {
  SettingsStackParamList,
  SettingsStackScreenComponents,
  useSettingsStack,
} from '../../../Navigation/Stacks/SettingsStackNavigator.tsx';
import {useModal} from '../../../Context/Contexts/ModalContext.ts';
import {LogoutDeviceModalView} from '../../../Views/Modals/LogoutModal.tsx';
import {ListSubheader} from '../../../Lists/ListSubheader.tsx';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {CommonStackComponents} from '../../../Navigation/CommonScreens.tsx';
import {useUserProfileQuery} from '../../../Queries/User/UserQueries.ts';

type Props = NativeStackScreenProps<SettingsStackParamList, SettingsStackScreenComponents.accountManagement>;
export const AccountManagementScreen = ({navigation}: Props) => {
  const settingsNavigation = useSettingsStack();
  const {data: profilePublicData} = useUserProfileQuery();
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
                onPress={() =>
                  navigation.push(CommonStackComponents.siteUIScreen, {
                    resource: 'createAltAccount',
                  })
                }
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
