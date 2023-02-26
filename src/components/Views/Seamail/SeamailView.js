import {AppView} from '../AppView';
import {Text, useTheme} from 'react-native-paper';
import React, {useCallback, useState} from 'react';
import {AppContainerView} from '../AppContainerView';
import {SaveButton} from '../../Buttons/SaveButton';
import {Linking, RefreshControl, ScrollView} from 'react-native';
import {AppSettings} from '../../../libraries/AppSettings';
import {commonStyles} from '../../../styles';
import {useUserNotificationData} from '../../Context/Contexts/UserNotificationDataContext';

export const SeamailView = () => {
  const theme = useTheme();
  const {refetch} = useUserNotificationData();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().finally(() => setRefreshing(false));
  }, []);

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
