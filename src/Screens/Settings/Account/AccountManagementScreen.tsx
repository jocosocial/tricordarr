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
import {useUserProfileQuery} from '#src/Queries/User/UserQueries';

type Props = StackScreenProps<SettingsStackParamList, SettingsStackScreenComponents.accountManagement>;
export const AccountManagementScreen = ({navigation}: Props) => {
  const settingsNavigation = useSettingsStack();
  const {data: profilePublicData} = useUserProfileQuery();
  const {isLoggedIn} = useSession();
  const {setModalContent, setModalVisible} = useModal();

  const handleLogoutModal = (allDevices = false) => {
    setModalContent(<LogoutDeviceModalView allDevices={allDevices} />);
    setModalVisible(true);
  };

  if (!isLoggedIn) {
    return <NotLoggedInView />;
  }

  // Need to conditional on ProfilePublicData in case it never loaded because the user lost communication
  // with the server. Logout device should still be allowed when no local data because it clears state.
  // I'm not sure how true that is now that SessionProvider is a thing.
  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <PaddedContentView padSides={false}>
          {profilePublicData && (
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
                <MinorActionListItem
                  title={'Sessions'}
                  icon={AppIcons.session}
                  onPress={() => settingsNavigation.push(SettingsStackScreenComponents.sessionSettings)}
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
