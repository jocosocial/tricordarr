import React, {useCallback, useEffect, useState} from 'react';
import {AppView} from '#src/Views/AppView.tsx';
import {ScrollingContentView} from '#src/Views/Content/ScrollingContentView.tsx';
import {PaddedContentView} from '#src/Views/Content/PaddedContentView.tsx';
import {MainStackComponents, MainStackParamList} from '#src/Navigation/Stacks/MainStackNavigator.tsx';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useDrawer} from '#src/Context/Contexts/DrawerContext.ts';
import {TodayAnnouncementView} from '#src/Views/Today/TodayAnnouncementView.tsx';
import {RefreshControl, View} from 'react-native';
import {useDailyThemeQuery} from '#src/Queries/Alert/DailyThemeQueries.ts';
import {useAnnouncementsQuery} from '#src/Queries/Alert/AnnouncementQueries.ts';
import {useUserFavoritesQuery} from '#src/Queries/Users/UserFavoriteQueries.ts';
import {useUserMutesQuery} from '#src/Queries/Users/UserMuteQueries.ts';
import {useUserBlocksQuery} from '#src/Queries/Users/UserBlockQueries.ts';
import {useUserNotificationDataQuery} from '#src/Queries/Alert/NotificationQueries.ts';
import {useAuth} from '#src/Context/Contexts/AuthContext.ts';
import {ModeratorCard} from '#src/Cards/MainScreen/ModeratorCard.tsx';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext.ts';
import {TodayThemeView} from '#src/Views/Today/TodayThemeView.tsx';
import {TodayNextAppointmentView} from '#src/Views/Today/TodayNextAppointmentView.tsx';
import {MainAccountMenu} from '#src/Menus/MainAccountMenu.tsx';
import {TodayHeaderView} from '#src/Views/Today/TodayHeaderView.tsx';
import {TodayHeaderTitle} from '#src/Navigation/Components/TodayHeaderTitle.tsx';
import {TodayTimezoneWarningView} from '#src/Views/Today/TodayTimezoneWarningView.tsx';
import {TodayAppUpdateView} from '#src/Views/TodayAppUpdateView.tsx';
import {useClientConfigQuery} from '#src/Queries/Client/ClientQueries.ts';
import {NotificationsMenu} from '#src/Menus/NotificationsMenu.tsx';
import {MaterialHeaderButton} from '#src/Buttons/MaterialHeaderButton.tsx';
import {HeaderButtons} from 'react-navigation-header-buttons';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries.ts';

type Props = NativeStackScreenProps<MainStackParamList, MainStackComponents.mainScreen>;

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
