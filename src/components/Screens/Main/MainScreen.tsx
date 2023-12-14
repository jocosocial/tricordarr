import React, {useEffect} from 'react';
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
import {useUserFavoritesQuery} from '../../Queries/Users/UserFavoriteQueries';
import {useUserMutesQuery} from '../../Queries/Users/UserMuteQueries';
import {useUserBlocksQuery} from '../../Queries/Users/UserBlockQueries';
import {useUserNotificationDataQuery} from '../../Queries/Alert/NotificationQueries';

type Props = NativeStackScreenProps<MainStackParamList, MainStackComponents.mainScreen, NavigatorIDs.mainStack>;

export const MainScreen = ({navigation}: Props) => {
  const {getLeftMainHeaderButtons} = useDrawer();
  const {refetch: refetchThemes, isFetching: isDailyThemeFetching} = useDailyThemeQuery();
  const {refetch: refetchAnnouncements, isFetching: isAnnouncementsFetching} = useAnnouncementsQuery();
  const {userNotificationData} = useUserNotificationData();
  const {refetch: refetchUserNotificationData, isFetching: isUserNotificationDataFetching} =
    useUserNotificationDataQuery();
  const {refetch: refetchFavorites, isFetching: isFavoritesFetching} = useUserFavoritesQuery();
  const {refetch: refetchMutes, isFetching: isMutesFetching} = useUserMutesQuery();
  const {refetch: refetchBlocks, isFetching: isBlocksFetching} = useUserBlocksQuery();

  const isRefreshing =
    isUserNotificationDataFetching ||
    isAnnouncementsFetching ||
    isDailyThemeFetching ||
    isFavoritesFetching ||
    isMutesFetching ||
    isBlocksFetching;

  const onRefresh = () => {
    refetchUserNotificationData();
    refetchThemes();
    refetchAnnouncements();
    refetchFavorites();
    refetchBlocks();
    refetchMutes();
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
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}>
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
