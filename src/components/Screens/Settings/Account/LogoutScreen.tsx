import React from 'react';
import {Text} from 'react-native-paper';
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

export const TempUserProfile = () => {
  const {profilePublicData} = useUserData();

  return <Text>{JSON.stringify(profilePublicData)}</Text>;
};

export const LogoutScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation();
  const {setProfilePublicData} = useUserData();
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
    navigation.goBack();
  };

  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <PaddedContentView>
          <TempUserProfile />
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
