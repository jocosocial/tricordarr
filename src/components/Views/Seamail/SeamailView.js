import {AppView} from '../AppView';
import {Text, useTheme} from 'react-native-paper';
import React, {useCallback, useState} from 'react';
import {AppContainerView} from '../AppContainerView';
import {SaveButton} from '../../Buttons/SaveButton';
import {Linking, RefreshControl, ScrollView} from 'react-native';
import {AppSettings} from '../../../libraries/AppSettings';
import {commonStyles} from '../../../styles';
import {useUserNotificationData} from '../../Context/Contexts/UserNotificationDataContext';
import {useQuery} from '@tanstack/react-query';
import {UserNotificationData} from '../../../libraries/Structs/ControllerStructs';
import {useUserData} from '../../Context/Contexts/UserDataContext';

export const SeamailView = () => {
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const {isLoggedIn} = useUserData();
  const {setUserNotificationData} = useUserNotificationData();

  const {data, refetch} = useQuery({
    queryKey: ['/notification/global'],
    enabled: !!isLoggedIn,
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch()
      .then(() => {
        if (data) {
          setUserNotificationData(data);
        }
      })
      .finally(() => setRefreshing(false));
  }, [data, refetch, setUserNotificationData]);

  async function onPress() {
    const serverUrl = await AppSettings.SERVER_URL.getValue();
    await Linking.openURL(`${serverUrl}/seamail`);
  }

  // @ts-ignore
  return (
    <AppView>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <AppContainerView>
          <Text variant={'titleLarge'}>This area is still under construction!</Text>
          <Text style={commonStyles.marginTop}>Press the button below to open Twitarr in your browser.</Text>
          <Text>You can also pull to refresh this page to reload the notification data.</Text>
          <SaveButton buttonText={'Open Browser'} buttonColor={theme.colors.twitarrNeutralButton} onPress={onPress} />
        </AppContainerView>
      </ScrollView>
    </AppView>
  );
};
