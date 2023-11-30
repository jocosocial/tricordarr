import React, {useCallback, useEffect, useState} from 'react';
import {AppView} from '../AppView';
import {ScrollingContentView} from '../Content/ScrollingContentView';
import {RefreshControl} from 'react-native';
import {LoadingView} from '../Static/LoadingView';
import {Text} from 'react-native-paper';
import {useTwitarr} from '../../Context/Contexts/TwitarrContext';
import {PaddedContentView} from '../Content/PaddedContentView';
import {ForumListDataActions} from '../../Reducers/Forum/ForumListDataReducer';
import {ForumThreadFlatList} from '../../Lists/Forums/ForumThreadFlatList';
import {ForumFilter, ForumSortOrder} from '../../../libraries/Enums/ForumSortFilter';
import {useFilter} from '../../Context/Contexts/FilterContext';
import {useForumRelationQuery} from '../../Queries/Forum/ForumRelationQueries';
import {ForumFAB} from '../../Buttons/FloatingActionButtons/ForumFAB';

export const ForumCategoryRelationsView = ({
  forumFilter,
  categoryId,
}: {
  forumFilter: ForumFilter;
  categoryId?: string;
}) => {
  const {forumSortOrder} = useFilter();
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
  } = useForumRelationQuery(ForumFilter.toRelation(forumFilter), {
    cat: categoryId,
    sort: forumSortOrder !== ForumSortOrder.event ? forumSortOrder : undefined,
  });
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
    </AppView>
  );
};
