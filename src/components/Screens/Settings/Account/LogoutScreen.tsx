import React from 'react';
import {Text} from 'react-native-paper';
import axios from 'axios';
import {useMutation} from '@tanstack/react-query';
import {PrimaryActionButton} from '../../../Buttons/PrimaryActionButton';
import {AppSettings} from '../../../../libraries/AppSettings';
import {useNavigation} from '@react-navigation/native';
import {useUserData} from '../../../Context/Contexts/UserDataContext';
import {useUserNotificationData} from '../../../Context/Contexts/UserNotificationDataContext';
import {ScrollingContentView} from '../../../Views/Content/ScrollingContentView';
import {AppView} from '../../../Views/AppView';
import {PaddedContentView} from '../../../Views/Content/PaddedContentView';
import {useAppTheme} from '../../../../styles/Theme';
import {ProfilePublicData, UserNotificationData} from '../../../../libraries/Structs/ControllerStructs';
import {useAuth} from '../../../Context/Contexts/AuthContext';

export const TempUserProfile = () => {
  const {profilePublicData} = useUserData();

  return <Text>{JSON.stringify(profilePublicData)}</Text>;
};

export const LogoutScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation();
  const {setIsLoggedIn, setProfilePublicData} = useUserData();
  const {setEnableUserNotifications, setUserNotificationData} = useUserNotificationData();
  const {signOut} = useAuth();

  const logoutMutation = useMutation(
    async () => {
      // Gotta do the call before clearing our local state.
      // await stopForegroundServiceWorker();
      let response = await axios.post('/auth/logout');
      await clearAuthData();
      return response;
    },
    {retry: 0},
  );

  const onLogout = () => {
    setEnableUserNotifications(false);
    setProfilePublicData({} as ProfilePublicData);
    setUserNotificationData({} as UserNotificationData);
    signOut();
    navigation.goBack();
  };

  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <PaddedContentView>
          <TempUserProfile />
          <PrimaryActionButton
            buttonColor={theme.colors.twitarrNegativeButton}
            buttonText={'Logout'}
            onPress={onLogout}
          />
          <PrimaryActionButton
            buttonColor={theme.colors.twitarrNeutralButton}
            buttonText={'Clear Auth Data'}
            onPress={onLogout}
          />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
