import React from 'react';
import {View} from 'react-native';
import {Text, useTheme} from 'react-native-paper';
import axios from 'axios';
import {useMutation} from '@tanstack/react-query';
import {SaveButton} from '../../Buttons/SaveButton';
import {AppSettings} from '../../../libraries/AppSettings';
import {useNavigation} from '@react-navigation/native';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {useUserNotificationData} from '../../Context/Contexts/UserNotificationDataContext';

export const TempUserProfile = () => {
  const {profilePublicData} = useUserData();

  return <Text>{JSON.stringify(profilePublicData)}</Text>;
};

export const LogoutView = () => {
  const theme = useTheme();
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
    setProfilePublicData({});
    setUserNotificationData({});
    logoutMutation.mutate(null, {
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
    navigation.goBack();
  }

  return (
    <View style={{backgroundColor: theme.colors.background}}>
      <TempUserProfile />
      <SaveButton buttonColor={theme.colors.twitarrNegativeButton} buttonText={'Logout'} onPress={onPress} />
      <SaveButton
        buttonColor={theme.colors.twitarrNeutralButton}
        buttonText={'Clear Auth Data'}
        onPress={clearAuthData}
      />
      {logoutMutation.isError ? <Text>An error occurred: {logoutMutation.error.message}</Text> : null}
      {logoutMutation.isSuccess ? <Text>Logged out!</Text> : null}
    </View>
  );
};
