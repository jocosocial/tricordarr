import React, {useEffect, useState} from 'react';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {MainStackComponents, NavigatorIDs} from '../../../libraries/Enums/Navigation';
import {MainStackParamList} from '../../Navigation/Stacks/MainStack';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useDrawer} from '../../Context/Contexts/DrawerContext';
import {DailyThemeCard} from '../../Cards/MainScreen/DailyThemeCard';
import {HeaderCard} from '../../Cards/MainScreen/HeaderCard';
import {MainAnnouncementView} from '../../Views/MainAnnouncementView';
import {RefreshControl} from 'react-native';
import {useDailyThemeQuery} from '../../Queries/Alert/DailyThemeQueries';
import {useAnnouncementsQuery} from '../../Queries/Alert/AnnouncementQueries';
import {useUserNotificationData} from '../../Context/Contexts/UserNotificationDataContext';
import {NextEventCard} from '../../Cards/MainScreen/NextEventCard';

type Props = NativeStackScreenProps<MainStackParamList, MainStackComponents.mainScreen, NavigatorIDs.mainStack>;

export const MainScreen = ({navigation}: Props) => {
  const {getLeftMainHeaderButtons} = useDrawer();
  const [refreshing, setRefreshing] = useState(false);
  const {refetch: refetchThemes} = useDailyThemeQuery();
  const {refetch: refetchAnnouncements} = useAnnouncementsQuery();
  const {refetchUserNotificationData, userNotificationData} = useUserNotificationData();

  const onRefresh = () => {
    setRefreshing(true);
    refetchUserNotificationData().then(() =>
      refetchThemes().then(() => refetchAnnouncements().then(() => setRefreshing(false))),
    );
  };

  useEffect(() => {
    navigation.setOptions({
      headerLeft: getLeftMainHeaderButtons,
    });
  }, [getLeftMainHeaderButtons, navigation]);

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <PaddedContentView padTop={true}>
          <HeaderCard />
          <DailyThemeCard />
          <MainAnnouncementView />
          {userNotificationData?.nextFollowedEventID && (
            <NextEventCard eventID={userNotificationData.nextFollowedEventID} />
          )}
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
