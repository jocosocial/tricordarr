import {StackScreenProps} from '@react-navigation/stack';
import {FlashListRef} from '@shopify/flash-list';
import {useQueryClient} from '@tanstack/react-query';
import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';

import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {ForumPostList} from '#src/Components/Lists/Forums/ForumPostList';
import {AppView} from '#src/Components/Views/AppView';
import {ListTitleView} from '#src/Components/Views/ListTitleView';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {usePagination} from '#src/Hooks/usePagination';
import {useRefresh} from '#src/Hooks/useRefresh';
import {ForumStackComponents, ForumStackParamList} from '#src/Navigation/Stacks/ForumStackNavigator';
import {useForumPostSearchQuery} from '#src/Queries/Forum/ForumPostSearchQueries';
import {PostData, UserNotificationData} from '#src/Structs/ControllerStructs';

type Props = StackScreenProps<ForumStackParamList, ForumStackComponents.forumPostAlertwordScreen>;

export const ForumPostAlertwordScreen = ({route}: Props) => {
  const {data, refetch, hasNextPage, fetchNextPage, isFetchingNextPage, isFetching} = useForumPostSearchQuery({
    search: route.params.alertWord,
  });
  const {commonStyles} = useStyles();
  const [forumPosts, setForumPosts] = useState<PostData[]>([]);
  const flatListRef = useRef<FlashListRef<PostData>>(null);
  const queryClient = useQueryClient();
  const {refreshing, setRefreshing, onRefresh} = useRefresh({
    refresh: refetch,
    isRefreshing: isFetching,
  });

  const {handleLoadNext} = usePagination({
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    setRefreshing,
  });

  useEffect(() => {
    if (data && data.pages) {
      setForumPosts(data.pages.flatMap(p => p.posts));
      Promise.all(UserNotificationData.getCacheKeys().map(key => queryClient.invalidateQueries({queryKey: key})));
    }
  }, [data, setForumPosts, queryClient, route.params.alertWord]);

  return (
    <AppView>
      <ListTitleView title={route.params.alertWord} />
      <View style={[commonStyles.flex]}>
        <ForumPostList
          listRef={flatListRef}
          refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          postList={forumPosts}
          handleLoadNext={handleLoadNext}
          itemSeparator={'time'}
          enableShowInThread={true}
          hasNextPage={hasNextPage}
        />
      </View>
    </AppView>
  );
};
