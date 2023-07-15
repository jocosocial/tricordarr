import React from 'react';
import {List} from 'react-native-paper';
import {useUserData} from '../../../Context/Contexts/UserDataContext';
import {useUserNotificationData} from '../../../Context/Contexts/UserNotificationDataContext';
import {ScrollingContentView} from '../../../Views/Content/ScrollingContentView';
import {AppView} from '../../../Views/AppView';
import {PaddedContentView} from '../../../Views/Content/PaddedContentView';
import {useAuth} from '../../../Context/Contexts/AuthContext';
import {useLogoutMutation} from '../../../Queries/Auth/LogoutQueries';
import {UserNotificationDataActions} from '../../../Reducers/Notification/UserNotificationDataReducer';
import {useSocket} from '../../../Context/Contexts/SocketContext';
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

export const AccountManagementScreen = () => {
  const settingsNavigation = useSettingsStack();
  const bottomNav = useBottomTabNavigator();
  const {profilePublicData, setProfilePublicData} = useUserData();
  const {setEnableUserNotifications, dispatchUserNotificationData} = useUserNotificationData();
  const {signOut} = useAuth();
  const logoutMutation = useLogoutMutation({
    onSuccess: () => {
      onLogout();
    },
  });
  const {closeNotificationSocket, closeFezSocket} = useSocket();

  const onLogout = () => {
    setEnableUserNotifications(false);
    setProfilePublicData(undefined);
    dispatchUserNotificationData({
      type: UserNotificationDataActions.clear,
    });
    closeNotificationSocket();
    closeFezSocket();
    signOut();
    settingsNavigation.goBack();
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
            <MinorActionListItem title={'Logout this device'} icon={AppIcons.logout} onPress={onLogout} />
            <MinorActionListItem
              title={'Logout all devices'}
              icon={AppIcons.error}
              onPress={() => logoutMutation.mutate()}
            />
          </ListSection>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
