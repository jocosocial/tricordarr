import {FlashListRef} from '@shopify/flash-list';
import pluralize from 'pluralize';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {RefreshControl, View} from 'react-native';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {ForumPostList} from '#src/Components/Lists/Forums/ForumPostList';
import {AppView} from '#src/Components/Views/AppView';
import {ListTitleView} from '#src/Components/Views/ListTitleView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';
import {useUserNotificationDataQuery} from '#src/Queries/Alert/NotificationQueries';
import {ForumPostSearchQueryParams, useForumPostSearchQuery} from '#src/Queries/Forum/ForumPostSearchQueries';
import {useUserFavoritesQuery} from '#src/Queries/Users/UserFavoriteQueries';
import {PostData} from '#src/Structs/ControllerStructs';

interface Props {
  queryParams: ForumPostSearchQueryParams;
  refreshOnUserNotification?: boolean;
  title?: string;
}

/**
 * Used for screens listing posts such as Favorites, Hashtags, Mentions, By User, By Self.
 * Not used for Post Search
 */
export const ForumPostScreenBase = ({queryParams, refreshOnUserNotification, title}: Props) => {
  const {data, refetch, isFetchingNextPage, hasNextPage, hasPreviousPage, fetchNextPage, isLoading} =
    useForumPostSearchQuery(queryParams);
  const commonNavigation = useCommonStack();
  const [refreshing, setRefreshing] = useState(false);
  const [forumPosts, setForumPosts] = useState<PostData[]>([]);
  const {data: userNotificationData, refetch: refetchUserNotificationData} = useUserNotificationDataQuery();
  const flatListRef = useRef<FlashListRef<PostData>>(null);
  // This is used deep in the FlatList to star posts by favorite users.
  // Will trigger an initial load if the data is empty else a background refetch on staleTime.
  const {isLoading: isLoadingFavorites} = useUserFavoritesQuery();

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().then(() => setRefreshing(false));
  }, [refetch]);

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons>
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => {
              commonNavigation.push(CommonStackComponents.forumHelpScreen);
            }}
          />
        </MaterialHeaderButtons>
      </View>
    );
  }, [commonNavigation]);

  const handleLoadNext = () => {
    if (!isFetchingNextPage && hasNextPage) {
      setRefreshing(true);
      fetchNextPage().finally(() => setRefreshing(false));
    }
  };

  useEffect(() => {
    if (refreshOnUserNotification && userNotificationData?.newForumMentionCount) {
      onRefresh();
    }
  }, [onRefresh, refreshOnUserNotification, userNotificationData?.newForumMentionCount]);

  useEffect(() => {
    commonNavigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, commonNavigation]);

  useEffect(() => {
    if (data) {
      setForumPosts(data.pages.flatMap(p => p.posts));
    }
    if (userNotificationData?.newForumMentionCount) {
      refetchUserNotificationData();
    }
  }, [data, setForumPosts, refetchUserNotificationData, userNotificationData?.newForumMentionCount]);

  if (isLoading || isLoadingFavorites || !data) {
    return <LoadingView />;
  }

  return (
    <AppView>
      {title && (
        <ListTitleView
          title={title}
          subtitle={`${data.pages[0].paginator.total} ${pluralize('result', data.pages[0].paginator.total)}`}
        />
      )}
      <ForumPostList
        listRef={flatListRef}
        postList={forumPosts}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        handleLoadNext={handleLoadNext}
        itemSeparator={'time'}
        enableShowInThread={true}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
      />
    </AppView>
  );
};
