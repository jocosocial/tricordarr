import {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {ModeratorCard} from '#src/Components/Cards/MainScreen/ModeratorCard';
import {TodayPreRegistrationCard} from '#src/Components/Cards/MainScreen/TodayPreRegistrationCard';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
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
import {useDrawer} from '#src/Context/Contexts/DrawerContext';
import {usePreRegistration} from '#src/Context/Contexts/PreRegistrationContext';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useRefresh} from '#src/Hooks/useRefresh';
import {MainStackComponents, MainStackParamList} from '#src/Navigation/Stacks/MainStackNavigator';
import {useAnnouncementsQuery} from '#src/Queries/Alert/AnnouncementQueries';
import {useDailyThemeQuery} from '#src/Queries/Alert/DailyThemeQueries';
import {useUserNotificationDataQuery} from '#src/Queries/Alert/NotificationQueries';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries';
import {useUserFavoritesQuery} from '#src/Queries/Users/UserFavoriteQueries';

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
  const {refetch: refetchUserNotificationData} = useUserNotificationDataQuery({enabled: false});
  const {refetch: refetchProfile} = useUserProfileQuery({enabled: false});
  const {isLoggedIn} = useSession();
  const {hasModerator} = usePrivilege();
  const {preRegistrationMode} = usePreRegistration();
  const {refreshing, onRefresh} = useRefresh({
    refresh: useCallback(async () => {
      var refreshes: Promise<any>[] = [];
      // These queries not available in pre-registration mode.
      if (!preRegistrationMode) {
        refreshes.push(refetchAnnouncements(), refetchThemes(), refetchUserNotificationData());
        if (isLoggedIn) {
          // useUserProfileQuery is here because the menu has the users picture.
          // useUserFavoritesQuery is here because the favorites list is sneakily used
          // in various places within the app that are not worth refetching directly in.
          refreshes.push(refetchProfile(), refetchFavorites());
        }
      }
      await Promise.all(refreshes);
    }, [
      preRegistrationMode,
      isLoggedIn,
      refetchAnnouncements,
      refetchThemes,
      refetchUserNotificationData,
      refetchProfile,
      refetchFavorites,
    ]),
  });

  const getRightMainHeaderButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons>
          {isLoggedIn && <NotificationsMenu />}
          <MainAccountMenu />
        </MaterialHeaderButtons>
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
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <TodayHeaderView />
        {preRegistrationMode && (
          <PaddedContentView padBottom={false}>
            <TodayPreRegistrationCard />
          </PaddedContentView>
        )}
        {!preRegistrationMode && (
          <>
            <TodayTimezoneWarningView />
            <TodayAnnouncementView />
            <TodayThemeView />
            <TodayNextAppointmentView />
            {hasModerator && (
              <PaddedContentView padBottom={false}>
                <ModeratorCard />
              </PaddedContentView>
            )}
          </>
        )}
        <TodayAppUpdateView />
      </ScrollingContentView>
    </AppView>
  );
};
