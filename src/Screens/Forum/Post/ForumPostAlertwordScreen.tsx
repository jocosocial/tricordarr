import {StackScreenProps} from '@react-navigation/stack';
import {FlashListRef} from '@shopify/flash-list';
import {useQueryClient} from '@tanstack/react-query';
import React, {useEffect, useRef, useState} from 'react';
import {RefreshControl, View} from 'react-native';

import {ForumPostList} from '#src/Components/Lists/Forums/ForumPostList';
import {AppView} from '#src/Components/Views/AppView';
import {ListTitleView} from '#src/Components/Views/ListTitleView';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {ForumStackComponents, ForumStackParamList} from '#src/Navigation/Stacks/ForumStackNavigator';
import {useForumPostSearchQuery} from '#src/Queries/Forum/ForumPostSearchQueries';
import {PostData} from '#src/Structs/ControllerStructs';

type Props = StackScreenProps<ForumStackParamList, ForumStackComponents.forumPostAlertwordScreen>;

export const ForumPostAlertwordScreen = ({route}: Props) => {
  const {data, refetch, hasNextPage, fetchNextPage, isFetchingNextPage, isFetching} = useForumPostSearchQuery({
    search: route.params.alertWord,
  });
  const {commonStyles} = useStyles();
  const [forumPosts, setForumPosts] = useState<PostData[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const flatListRef = useRef<FlashListRef<PostData>>(null);
  const queryClient = useQueryClient();

  const handleLoadNext = () => {
    if (!isFetchingNextPage && hasNextPage) {
      setRefreshing(true);
      fetchNextPage().finally(() => setRefreshing(false));
    }
  };

  useEffect(() => {
    if (data && data.pages) {
      setForumPosts(data.pages.flatMap(p => p.posts));
      queryClient.invalidateQueries({queryKey: ['/notification/global']});
    }
  }, [data, setForumPosts, queryClient, route.params.alertWord]);

  return (
    <AppView>
      <ListTitleView title={route.params.alertWord} />
      <View style={[commonStyles.flex]}>
        <ForumPostList
          listRef={flatListRef}
          refreshControl={<RefreshControl refreshing={isFetching || refreshing} onRefresh={refetch} />}
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
