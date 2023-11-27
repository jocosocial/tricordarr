import React, {useCallback, useEffect, useState} from 'react';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {useForumPostSearchQuery} from '../../Queries/Forum/ForumSearchQueries';
import {RefreshControl} from 'react-native';
import {LoadingView} from '../../Views/Static/LoadingView';
import {useTwitarr} from '../../Context/Contexts/TwitarrContext';
import {ForumPostListActions} from '../../Reducers/Forum/ForumPostListReducer';
import {Text} from 'react-native-paper';
import {ForumPostListItem} from '../../Lists/Items/Forum/ForumPostListItem';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {useUserNotificationData} from '../../Context/Contexts/UserNotificationDataContext';

export const ForumPostMentionScreen = () => {
  const {data, refetch} = useForumPostSearchQuery({mentionself: true});
  const [refreshing, setRefreshing] = useState(false);
  const {forumPosts, dispatchForumPosts} = useTwitarr();
  const {userNotificationData, refetchUserNotificationData} = useUserNotificationData();

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().then(() => setRefreshing(false));
  }, [refetch]);

  useEffect(() => {
    if (userNotificationData?.newForumMentionCount) {
      onRefresh();
    }
  }, [onRefresh, userNotificationData?.newForumMentionCount]);

  useEffect(() => {
    if (data) {
      dispatchForumPosts({
        type: ForumPostListActions.setList,
        postList: data.pages.flatMap(p => p.posts),
      });
    }
    if (userNotificationData?.newForumMentionCount) {
      refetchUserNotificationData();
    }
  }, [data, dispatchForumPosts, refetchUserNotificationData, userNotificationData?.newForumMentionCount]);

  if (!data) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <ScrollingContentView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {forumPosts.map((fp, index) => {
          return (
            <PaddedContentView key={index} padBottom={true}>
              <ForumPostListItem postData={fp} />
            </PaddedContentView>
          );
        })}
      </ScrollingContentView>
    </AppView>
  );
};
