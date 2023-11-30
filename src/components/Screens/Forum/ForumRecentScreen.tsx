import React, {useCallback, useEffect, useState} from 'react';
import {RefreshControl} from 'react-native';
import {useTwitarr} from '../../Context/Contexts/TwitarrContext';
import {ForumListDataActions} from '../../Reducers/Forum/ForumListDataReducer';
import {LoadingView} from '../../Views/Static/LoadingView';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {Text} from 'react-native-paper';
import {ForumThreadFlatList} from '../../Lists/Forums/ForumThreadFlatList';
import {useForumRecentQuery} from '../../Queries/Forum/ForumRelationQueries';
import {ForumFAB} from '../../Buttons/FloatingActionButtons/ForumFAB';

export const ForumRecentScreen = () => {
  const {
    data,
    refetch,
    isLoading,
    hasPreviousPage,
    fetchPreviousPage,
    isFetchingPreviousPage,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useForumRecentQuery();
  const [refreshing, setRefreshing] = useState(false);
  const {forumListData, dispatchForumListData} = useTwitarr();

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
      dispatchForumListData({
        type: ForumListDataActions.setList,
        threadList: data.pages.flatMap(p => p.forumThreads || []),
      });
    }
  }, [data, dispatchForumListData]);

  if (!data) {
    return <LoadingView />;
  }

  if (forumListData.length === 0) {
    return (
      <AppView>
        <ScrollingContentView
          isStack={true}
          refreshControl={<RefreshControl refreshing={refreshing || isLoading} onRefresh={onRefresh} />}>
          <PaddedContentView padTop={true}>
            <Text>There aren't any forums matching these filters.</Text>
          </PaddedContentView>
        </ScrollingContentView>
      </AppView>
    );
  }

  return (
    <AppView>
      <ForumThreadFlatList
        forumListData={forumListData}
        handleLoadNext={handleLoadNext}
        handleLoadPrevious={handleLoadPrevious}
        refreshControl={<RefreshControl refreshing={refreshing || isLoading} onRefresh={onRefresh} />}
      />
      <ForumFAB />
    </AppView>
  );
};
