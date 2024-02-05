import React, {useCallback, useEffect, useState} from 'react';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {MainStackComponents, NavigatorIDs} from '../../../libraries/Enums/Navigation';
import {MainStackParamList} from '../../Navigation/Stacks/MainStackNavigator';
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
  // These queries are disabled to prevent bombarding the server on app launch. Some will fire anyway such as themes or
  // announcements but typically have a higher than usual stale time.
  // The rest are here for pull-to-refetch.
  // The exception is UserNotificationData because that needs to more aggressively re-fire. But because I put it in
  // state rather than reference the query it rarely organically refetches.
  const {refetch: refetchThemes} = useDailyThemeQuery({enabled: false});
  const {refetch: refetchAnnouncements} = useAnnouncementsQuery({enabled: false});
  const {refetch: refetchFavorites} = useUserFavoritesQuery({enabled: false});
  const {refetch: refetchMutes} = useUserMutesQuery({enabled: false});
  const {refetch: refetchBlocks} = useUserBlocksQuery({enabled: false});
  const {refetch: refetchUserNotificationData} = useUserNotificationDataQuery({enabled: false});
  const {isLoggedIn} = useAuth();
  const {hasModerator} = usePrivilege();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchUserNotificationData(), refetchThemes(), refetchAnnouncements()]);
    if (isLoggedIn) {
      await Promise.all([refetchFavorites(), refetchBlocks(), refetchMutes()]);
    }
    setRefreshing(false);
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <MainHeaderView />
        <MainAnnouncementView />
        <MainThemeView />
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
