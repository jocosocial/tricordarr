import React, {useCallback, useEffect} from 'react';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {MainStackComponents, NavigatorIDs} from '../../../libraries/Enums/Navigation';
import {MainStackParamList} from '../../Navigation/Stacks/MainStack';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useDrawer} from '../../Context/Contexts/DrawerContext';
import {MainAnnouncementView} from '../../Views/MainAnnouncementView';
import {RefreshControl, View} from 'react-native';
import {useDailyThemeQuery} from '../../Queries/Alert/DailyThemeQueries';
import {useAnnouncementsQuery} from '../../Queries/Alert/AnnouncementQueries';
import {useUserFavoritesQuery} from '../../Queries/Users/UserFavoriteQueries';
import {useUserMutesQuery} from '../../Queries/Users/UserMuteQueries';
import {useUserBlocksQuery} from '../../Queries/Users/UserBlockQueries';
import {useUserNotificationDataQuery} from '../../Queries/Alert/NotificationQueries';
import {useAuth} from '../../Context/Contexts/AuthContext';
import {ModeratorCard} from '../../Cards/MainScreen/ModeratorCard';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext';
import {MainThemeView} from '../../Views/MainThemeView';
import {MainNextEventView} from '../../Views/MainNextEventView';
import {MainAccountMenu} from '../../Menus/MainAccountMenu';
import {MainHeaderView} from '../../Views/MainHeaderView';
import {TodayHeaderTitle} from '../../Navigation/Components/TodayHeaderTitle';

type Props = NativeStackScreenProps<MainStackParamList, MainStackComponents.mainScreen, NavigatorIDs.mainStack>;

export const MainScreen = ({navigation}: Props) => {
  const {getLeftMainHeaderButtons} = useDrawer();
  const {refetch: refetchThemes, isFetching: isDailyThemeFetching} = useDailyThemeQuery({enabled: false});
  const {refetch: refetchAnnouncements, isFetching: isAnnouncementsFetching} = useAnnouncementsQuery({enabled: false});
  const {refetch: refetchUserNotificationData, isFetching: isUserNotificationDataFetching} =
    useUserNotificationDataQuery({enabled: false});
  const {refetch: refetchFavorites, isFetching: isFavoritesFetching} = useUserFavoritesQuery({enabled: false});
  const {refetch: refetchMutes, isFetching: isMutesFetching} = useUserMutesQuery({enabled: false});
  const {refetch: refetchBlocks, isFetching: isBlocksFetching} = useUserBlocksQuery({enabled: false});
  const {isLoggedIn} = useAuth();
  const {hasModerator} = usePrivilege();

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
    if (isLoggedIn) {
      refetchFavorites();
      refetchBlocks();
      refetchMutes();
    }
  };

  const getRightMainHeaderButtons = useCallback(() => {
    return (
      <View>
        <MainAccountMenu />
      </View>
    );
  }, []);

  const getTitle = useCallback(() => <TodayHeaderTitle />, []);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: getLeftMainHeaderButtons,
      headerRight: getRightMainHeaderButtons,
      headerTitle: getTitle,
    });
  }, [getLeftMainHeaderButtons, getRightMainHeaderButtons, getTitle, navigation]);

  return (
    <AppView>
      <ScrollingContentView
        isStack={true}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}>
        <MainHeaderView />
        <MainThemeView />
        <MainAnnouncementView />
        <MainNextEventView />
        {hasModerator && (
          <PaddedContentView>
            <ModeratorCard />
          </PaddedContentView>
        )}
      </ScrollingContentView>
    </AppView>
  );
};
