import {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useState} from 'react';
import {RefreshControl, View} from 'react-native';
import {HeaderButtons} from 'react-navigation-header-buttons';

import {MaterialHeaderButton} from '#src/Components/Buttons/MaterialHeaderButton';
import {ModeratorCard} from '#src/Components/Cards/MainScreen/ModeratorCard';
import {MainAccountMenu} from '#src/Components/Menus/MainAccountMenu';
import {NotificationsMenu} from '#src/Components/Menus/NotificationsMenu';
import {TodayHeaderTitle} from '#src/Components/Navigation/TodayHeaderTitle';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {TodayAnnouncementView} from '#src/Components/Views/Today/TodayAnnouncementView';
import {TodayHeaderView} from '#src/Components/Views/Today/TodayHeaderView';
import {TodayNextAppointmentView} from '#src/Components/Views/Today/TodayNextAppointmentView';
import {TodayThemeView} from '#src/Components/Views/Today/TodayThemeView';
import {TodayTimezoneWarningView} from '#src/Components/Views/Today/TodayTimezoneWarningView';
import {TodayAppUpdateView} from '#src/Components/Views/TodayAppUpdateView';
import {useAuth} from '#src/Context/Contexts/AuthContext';
import {useDrawer} from '#src/Context/Contexts/DrawerContext';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {MainStackComponents, MainStackParamList} from '#src/Navigation/Stacks/MainStackNavigator';
import {useAnnouncementsQuery} from '#src/Queries/Alert/AnnouncementQueries';
import {useDailyThemeQuery} from '#src/Queries/Alert/DailyThemeQueries';
import {useUserNotificationDataQuery} from '#src/Queries/Alert/NotificationQueries';
import {useClientConfigQuery} from '#src/Queries/Client/ClientQueries';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries';
import {useUserBlocksQuery} from '#src/Queries/Users/UserBlockQueries';
import {useUserFavoritesQuery} from '#src/Queries/Users/UserFavoriteQueries';
import {useUserMutesQuery} from '#src/Queries/Users/UserMuteQueries';

type Props = StackScreenProps<MainStackParamList, MainStackComponents.mainScreen>;

export const TodayScreen = ({navigation}: Props) => {
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
  const {refetch: refetchClient} = useClientConfigQuery({enabled: false});
  const {refetch: refetchProfile} = useUserProfileQuery({enabled: false});
  const {isLoggedIn} = useAuth();
  const {hasModerator} = usePrivilege();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchUserNotificationData(), refetchThemes(), refetchAnnouncements(), refetchClient()]);
    if (isLoggedIn) {
      await Promise.all([refetchProfile(), refetchFavorites(), refetchBlocks(), refetchMutes()]);
    }
    setRefreshing(false);
  };

  const getRightMainHeaderButtons = useCallback(() => {
    return (
      <View>
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          {isLoggedIn && <NotificationsMenu />}
          <MainAccountMenu />
        </HeaderButtons>
      </View>
    );
  }, [isLoggedIn]);

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
        <TodayHeaderView />
        <TodayTimezoneWarningView />
        <TodayAnnouncementView />
        <TodayThemeView />
        <TodayNextAppointmentView />
        {hasModerator && (
          <PaddedContentView padBottom={false}>
            <ModeratorCard />
          </PaddedContentView>
        )}
        <TodayAppUpdateView />
      </ScrollingContentView>
    </AppView>
  );
};
