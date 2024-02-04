import React, {useCallback, useEffect, useRef, useState} from 'react';
import {AppView} from '../../../Views/AppView';
import {ForumPostSearchQueryParams, useForumPostSearchQuery} from '../../../Queries/Forum/ForumPostSearchQueries';
import {FlatList, RefreshControl, View} from 'react-native';
import {LoadingView} from '../../../Views/Static/LoadingView';
import {ForumPostFlatList} from '../../../Lists/Forums/ForumPostFlatList';
import {PostData} from '../../../../libraries/Structs/ControllerStructs';
import {ListTitleView} from '../../../Views/ListTitleView';
import {useUserFavoritesQuery} from '../../../Queries/Users/UserFavoriteQueries';
import {useCommonStack} from '../../../Navigation/CommonScreens';
import {ForumPostScreenBaseActionsMenu} from '../../../Menus/Forum/ForumPostScreenBaseActionsMenu';
import {HeaderButtons} from 'react-navigation-header-buttons';
import {MaterialHeaderButton} from '../../../Buttons/MaterialHeaderButton';
import {useUserNotificationDataQuery} from '../../../Queries/Alert/NotificationQueries';

interface ForumPostScreenBaseProps {
  queryParams: ForumPostSearchQueryParams;
  refreshOnUserNotification?: boolean;
  title?: string;
}

/**
 * Used for screens listing posts such as Favorites, Hashtags, Mentions, By User, By Self.
 * Not used for Post Search
 */
export const ForumPostScreenBase = ({queryParams, refreshOnUserNotification, title}: ForumPostScreenBaseProps) => {
  const {
    data,
    refetch,
    isFetchingPreviousPage,
    isFetchingNextPage,
    hasNextPage,
    hasPreviousPage,
    fetchPreviousPage,
    fetchNextPage,
    isLoading,
  } = useForumPostSearchQuery(queryParams);
  const commonNavigation = useCommonStack();
  const [refreshing, setRefreshing] = useState(false);
  const [forumPosts, setForumPosts] = useState<PostData[]>([]);
  const {data: userNotificationData, refetch: refetchUserNotificationData} = useUserNotificationDataQuery();
  const flatListRef = useRef<FlatList<PostData>>(null);
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
        <HeaderButtons HeaderButtonComponent={MaterialHeaderButton}>
          <ForumPostScreenBaseActionsMenu onReload={onRefresh} />
        </HeaderButtons>
      </View>
    );
  }, [onRefresh]);

  const handleLoadNext = () => {
    if (!isFetchingNextPage && hasNextPage) {
      setRefreshing(true);
      fetchNextPage().finally(() => setRefreshing(false));
    }
  };
  const handleLoadPrevious = () => {
    if (!isFetchingPreviousPage && hasPreviousPage) {
      setRefreshing(true);
      fetchPreviousPage().finally(() => setRefreshing(false));
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

  if (isLoading || isLoadingFavorites) {
    return <LoadingView />;
  }

  return (
    <AppView>
      {title && <ListTitleView title={title} />}
      <ForumPostFlatList
        flatListRef={flatListRef}
        invertList={false}
        postList={forumPosts}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        handleLoadPrevious={handleLoadPrevious}
        handleLoadNext={handleLoadNext}
        itemSeparator={'time'}
        enableShowInThread={true}
        hasNextPage={hasNextPage}
      />
    </AppView>
  );
};
