import {AppView} from '../AppView';
import {Text, useTheme} from 'react-native-paper';
import React, {useCallback, useState} from 'react';
import {AppContainerView} from '../AppContainerView';
import {SaveButton} from '../../Buttons/SaveButton';
import {RefreshControl, ScrollView} from 'react-native';
import {commonStyles} from '../../../styles';
import {useUserNotificationData} from '../../Context/Contexts/UserNotificationDataContext';
import {useQuery} from '@tanstack/react-query';
import {UserNotificationData} from '../../../libraries/Structs/ControllerStructs';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {useLinkTo} from '@react-navigation/native';

export const SeamailView = () => {
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const {isLoggedIn} = useUserData();
  const {setUserNotificationData} = useUserNotificationData();
  const linkTo = useLinkTo();

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
    linkTo(`/twitarrtab/${Date.now()}/seamail`);
  }

  async function onPress2() {
    linkTo(`/twitarrtab/${Date.now()}/events`);
  }

  // @ts-ignore
  return (
    <AppView>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <AppContainerView>
          <Text variant={'titleLarge'}>This area is still under construction!</Text>
          <Text style={commonStyles.marginTop}>Press the button below to open the Twit-arr Seamail page.</Text>
          <Text>You can also pull to refresh this page to reload the notification data.</Text>
          <SaveButton buttonText={'Open Seamail'} buttonColor={theme.colors.twitarrNeutralButton} onPress={onPress} />
          <SaveButton buttonText={'Open Schedule'} buttonColor={theme.colors.twitarrNeutralButton} onPress={onPress2} />
        </AppContainerView>
      </ScrollView>
    </AppView>
  );
};
