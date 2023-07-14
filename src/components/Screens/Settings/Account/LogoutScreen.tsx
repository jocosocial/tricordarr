import React from 'react';
import {List, Text} from 'react-native-paper';
import {PrimaryActionButton} from '../../../Buttons/PrimaryActionButton';
import {useNavigation} from '@react-navigation/native';
import {useUserData} from '../../../Context/Contexts/UserDataContext';
import {useUserNotificationData} from '../../../Context/Contexts/UserNotificationDataContext';
import {ScrollingContentView} from '../../../Views/Content/ScrollingContentView';
import {AppView} from '../../../Views/AppView';
import {PaddedContentView} from '../../../Views/Content/PaddedContentView';
import {useAppTheme} from '../../../../styles/Theme';
import {useAuth} from '../../../Context/Contexts/AuthContext';
import {useLogoutMutation} from '../../../Queries/Auth/LogoutQueries';
import {UserNotificationDataActions} from '../../../Reducers/Notification/UserNotificationDataReducer';
import {useSocket} from '../../../Context/Contexts/SocketContext';
import {ListSection} from '../../../Lists/ListSection';
import {AppIcons} from '../../../../libraries/Enums/Icons';
import {AppIcon} from '../../../Images/AppIcon';
import {useStyles} from '../../../Context/Contexts/StyleContext';
import {MinorActionListItem} from '../../../Lists/Items/MinorActionListItem';
import {useSettingsStack} from '../../../Navigation/Stacks/SettingsStack';
import {
  BottomTabComponents,
  MainStackComponents,
  RootStackComponents,
  SeamailStackScreenComponents,
  SettingsStackScreenComponents,
} from '../../../../libraries/Enums/Navigation';
import {useMainStack} from '../../../Navigation/Stacks/MainStack';
import {useRootStack} from '../../../Navigation/Stacks/RootStackNavigator';
import {Linking} from 'react-native';
import {useBottomTabNavigator} from '../../../Navigation/Tabs/BottomTabNavigator';
import {LoadingView} from '../../../Views/Static/LoadingView';

export const TempUserProfile = () => {
  const {profilePublicData} = useUserData();

  return <Text>{JSON.stringify(profilePublicData)}</Text>;
};

export const LogoutScreen = () => {
  const theme = useAppTheme();
  const settingsNavigation = useSettingsStack();
  const rootNav = useRootStack();
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
  const {commonStyles} = useStyles();

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
          </ListSection>
        </PaddedContentView>
        <PaddedContentView>
          <PrimaryActionButton
            buttonColor={theme.colors.twitarrNeutralButton}
            buttonText={'Logout this device'}
            onPress={onLogout}
          />
        </PaddedContentView>
        <PaddedContentView>
          <PrimaryActionButton
            buttonColor={theme.colors.twitarrNegativeButton}
            buttonText={'Logout all devices'}
            onPress={() => logoutMutation.mutate()}
          />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
