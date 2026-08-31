import {FlashListRef} from '@shopify/flash-list';
import pluralize from 'pluralize';
import React, {ReactNode, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {ForumPostList} from '#src/Components/Lists/Forums/ForumPostList';
import {AppView} from '#src/Components/Views/AppView';
import {ListTitleView} from '#src/Components/Views/ListTitleView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useElevation} from '#src/Context/Contexts/ElevationContext';
import {AppIcons} from '#src/Enums/Icons';
import {PrivilegedUserAccounts} from '#src/Enums/UserAccessLevel';
import {usePagination} from '#src/Hooks/usePagination';
import {useRefresh} from '#src/Hooks/useRefresh';
import {
  CommonStackComponents,
  HelpScreenComponents,
  useCommonStack,
} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useUserNotificationDataQuery} from '#src/Queries/Alert/NotificationQueries';
import {ForumPostSearchQueryParams, useForumPostSearchQuery} from '#src/Queries/Forum/ForumPostSearchQueries';
import {useUserFavoritesQuery} from '#src/Queries/Users/UserFavoriteQueries';
import {PostData} from '#src/Structs/ControllerStructs';

interface Props {
  queryParams: ForumPostSearchQueryParams;
  refreshOnUserNotification?: boolean;
  title?: string;
  scrollToTopIntent?: number;
  header?: ReactNode;
  helpScreen?: HelpScreenComponents;
}

/**
 * Used for screens listing posts such as Favorites, Hashtags, Mentions, By User, By Self.
 * Not used for Post Search
 */
export const ForumPostScreenBase = ({
  queryParams,
  refreshOnUserNotification,
  title,
  scrollToTopIntent,
  header,
  helpScreen = CommonStackComponents.forumHelpScreen,
}: Props) => {
  const {asPrivilegedUser} = useElevation();
  const queryOptions = useMemo(
    () =>
      asPrivilegedUser
        ? {
            refetchOnWindowFocus: 'always' as const,
            refetchOnMount: true,
          }
        : {},
    [asPrivilegedUser],
  );
  const {data, refetch, isFetchingNextPage, hasNextPage, hasPreviousPage, fetchNextPage, isLoading, isFetching} =
    useForumPostSearchQuery(queryParams, queryOptions);
  const commonNavigation = useCommonStack();
  const [forumPosts, setForumPosts] = useState<PostData[]>([]);
  const {data: userNotificationData, refetch: refetchUserNotificationData} = useUserNotificationDataQuery();
  const flatListRef = useRef<FlashListRef<PostData>>(null);
  // This is used deep in the FlatList to star posts by favorite users.
  // Will trigger an initial load if the data is empty else a background refetch on staleTime.
  const {isLoading: isLoadingFavorites} = useUserFavoritesQuery();
  const {refreshing, setRefreshing, onRefresh} = useRefresh({
    refresh: refetch,
    isRefreshing: isFetching,
  });

  const notificationCount = useMemo(() => {
    if (asPrivilegedUser === PrivilegedUserAccounts.moderator) {
      return userNotificationData?.moderatorData?.newModeratorForumMentionCount;
    }
    if (asPrivilegedUser === PrivilegedUserAccounts.TwitarrTeam) {
      return userNotificationData?.moderatorData?.newTTForumMentionCount;
    }
    return userNotificationData?.newForumMentionCount;
  }, [
    asPrivilegedUser,
    userNotificationData?.moderatorData?.newModeratorForumMentionCount,
    userNotificationData?.moderatorData?.newTTForumMentionCount,
    userNotificationData?.newForumMentionCount,
  ]);

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons>
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => {
              commonNavigation.push(helpScreen);
            }}
          />
        </MaterialHeaderButtons>
      </View>
    );
  }, [commonNavigation, helpScreen]);

  const {handleLoadNext} = usePagination({
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    setRefreshing,
  });

  useEffect(() => {
    if (refreshOnUserNotification && notificationCount) {
      onRefresh();
    }
  }, [notificationCount, onRefresh, refreshOnUserNotification]);

  useEffect(() => {
    commonNavigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, commonNavigation]);

  useEffect(() => {
    if (data) {
      setForumPosts(data.pages.flatMap(p => p.posts));
    }
    if (notificationCount) {
      refetchUserNotificationData();
    }
  }, [data, notificationCount, refetchUserNotificationData]);

  useEffect(() => {
    if (scrollToTopIntent) {
      flatListRef.current?.scrollToOffset({offset: 0, animated: false});
    }
  }, [scrollToTopIntent]);

  if (isLoading || isLoadingFavorites || !data) {
    return <LoadingView />;
  }

  return (
    <AppView>
      {header}
      {title && (
        <ListTitleView
          title={title}
          subtitle={`${data.pages[0].paginator.total} ${pluralize('result', data.pages[0].paginator.total)}`}
        />
      )}
      <ForumPostList
        listRef={flatListRef}
        postList={forumPosts}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        handleLoadNext={handleLoadNext}
        itemSeparator={'time'}
        enableShowInThread={true}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
      />
    </AppView>
  );
};
