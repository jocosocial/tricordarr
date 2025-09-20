import {AppView} from '#src/Views/AppView.tsx';
import {FlatList, RefreshControl, View} from 'react-native';
import {ForumPostFlatList} from '#src/Lists/Forums/ForumPostFlatList.tsx';
import React, {useEffect, useRef, useState} from 'react';
import {useForumPostSearchQuery} from '#src/Queries/Forum/ForumPostSearchQueries.ts';
import {useStyles} from '#src/Context/Contexts/StyleContext.ts';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ForumStackComponents, ForumStackParamList} from '#src/Navigation/Stacks/ForumStackNavigator.tsx';
import {PostData} from '../../../../Libraries/Structs/ControllerStructs.tsx';
import {ListTitleView} from '#src/Views/ListTitleView.tsx';
import {useQueryClient} from '@tanstack/react-query';

type Props = NativeStackScreenProps<ForumStackParamList, ForumStackComponents.forumPostAlertwordScreen>;

export const ForumPostAlertwordScreen = ({route}: Props) => {
  const {
    data,
    refetch,
    hasNextPage,
    hasPreviousPage,
    fetchPreviousPage,
    fetchNextPage,
    isFetchingPreviousPage,
    isFetchingNextPage,
    isFetching,
  } = useForumPostSearchQuery({
    search: route.params.alertWord,
  });
  const {commonStyles} = useStyles();
  const [forumPosts, setForumPosts] = useState<PostData[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const flatListRef = useRef<FlatList<PostData>>(null);
  const queryClient = useQueryClient();

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
    if (data && data.pages) {
      setForumPosts(data.pages.flatMap(p => p.posts));
      queryClient.invalidateQueries(['/notification/global']);
    }
  }, [data, setForumPosts, queryClient, route.params.alertWord]);

  return (
    <AppView>
      <ListTitleView title={route.params.alertWord} />
      <View style={[commonStyles.flex]}>
        <ForumPostFlatList
          flatListRef={flatListRef}
          refreshControl={<RefreshControl refreshing={isFetching || refreshing} onRefresh={refetch} />}
          postList={forumPosts}
          handleLoadNext={handleLoadNext}
          handleLoadPrevious={handleLoadPrevious}
          itemSeparator={'time'}
          enableShowInThread={true}
          hasNextPage={hasNextPage}
        />
      </View>
    </AppView>
  );
};
