import React, {useEffect} from 'react';
import {View} from 'react-native';
import {Text, useTheme} from 'react-native-paper';
import axios from 'axios';
import {useMutation, useQuery} from '@tanstack/react-query';
import {SaveButton} from '../../Buttons/SaveButton';
import {AppSettings} from '../../../libraries/AppSettings';
// import {useNavigation} from '@react-navigation/native';

export const LogoutView = () => {
  const theme = useTheme();
  // const navigation = useNavigation();
  const {isLoading, error, data} = useQuery({
    queryKey: ['/user/profile'],
    enabled: false,
  });

  const logoutMutation = useMutation(
    async () => {
      // Gotta do the call before clearing our local state.
      let response = await axios.post('/auth/logout');
      await AppSettings.AUTH_TOKEN.remove();
      await AppSettings.USERNAME.remove();
      return response;
    },
    {retry: 0},
  );
  return (
    <View style={{backgroundColor: theme.colors.background}}>
      <Text>{JSON.stringify(data)}</Text>
      <SaveButton
        buttonColor={theme.colors.twitarrNegativeButton}
        buttonText={'Logout'}
        onPress={() => logoutMutation.mutate()}
      />
      {logoutMutation.isError ? <Text>An error occurred: {logoutMutation.error.message}</Text> : null}
      {logoutMutation.isSuccess ? <Text>Logged out!</Text> : null}
    </View>
  );
};
