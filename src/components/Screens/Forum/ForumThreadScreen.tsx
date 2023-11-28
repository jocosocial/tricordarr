import React, {useCallback, useEffect, useState} from 'react';
import {AppView} from '../../Views/AppView';
import {useForumThreadQuery} from '../../Queries/Forum/ForumCategoryQueries';
import {RefreshControl} from 'react-native';
import {LoadingView} from '../../Views/Static/LoadingView';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ForumStackParamList} from '../../Navigation/Stacks/ForumStackNavigator';
import {ForumStackComponents, NavigatorIDs} from '../../../libraries/Enums/Navigation';
import {PostData} from '../../../libraries/Structs/ControllerStructs';
import {ForumPostFlatList} from '../../Lists/Forums/ForumPostFlatList';

export type Props = NativeStackScreenProps<
  ForumStackParamList,
  ForumStackComponents.forumThreadScreen,
  NavigatorIDs.forumStack
>;

export const ForumThreadScreen = ({route}: Props) => {
  const {
    data,
    refetch,
    isLoading,
    fetchNextPage,
    fetchPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
    hasNextPage,
    hasPreviousPage,
  } = useForumThreadQuery(route.params.forumID);
  const [refreshing, setRefreshing] = useState(false);
  const [postList, setPostList] = useState<PostData[]>([]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().then(() => setRefreshing(false));
  }, [refetch]);

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
      setPostList(data.pages.flatMap(forumData => forumData.posts).reverse());
    }
  }, [data]);

  if (!data) {
    return <LoadingView />;
  }

  return (
    <AppView>
      <ForumPostFlatList
        postList={postList}
        handleLoadNext={handleLoadNext}
        handleLoadPrevious={handleLoadPrevious}
        refreshControl={<RefreshControl enabled={false} refreshing={refreshing} onRefresh={onRefresh || isLoading} />}
        invertList={true}
        forumData={data.pages[0]}
        hasPreviousPage={hasPreviousPage}
      />
    </AppView>
  );
};
