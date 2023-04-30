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

export const TempUserProfile = () => {
  const {profilePublicData} = useUserData();

  return <Text>{JSON.stringify(profilePublicData)}</Text>;
};

export const LogoutScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation();
  const {setIsLoggedIn, setProfilePublicData} = useUserData();
  const {setEnableUserNotifications, setUserNotificationData} = useUserNotificationData();

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

  function onPress() {
    setIsLoggedIn(false);
    setEnableUserNotifications(false);
    setProfilePublicData({} as ProfilePublicData);
    setUserNotificationData({} as UserNotificationData);
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigation.goBack();
      },
    });
  }

  async function clearAuthData() {
    console.log('Clearing auth data.');
    console.log('Old username was:', await AppSettings.USERNAME.getValue());
    console.log('Old token was:', await AppSettings.AUTH_TOKEN.getValue());
    await AppSettings.AUTH_TOKEN.remove();
    await AppSettings.USERNAME.remove();
    await AppSettings.USER_ID.remove();
    await AppSettings.ACCESS_LEVEL.remove();
    navigation.goBack();
  }

  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <PaddedContentView>
          <TempUserProfile />
          <PrimaryActionButton buttonColor={theme.colors.twitarrNegativeButton} buttonText={'Logout'} onPress={onPress}/>
          <PrimaryActionButton
            buttonColor={theme.colors.twitarrNeutralButton}
            buttonText={'Clear Auth Data'}
            onPress={clearAuthData}
          />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
