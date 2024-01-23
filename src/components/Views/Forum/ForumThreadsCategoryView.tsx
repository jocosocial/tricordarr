import React, {useEffect, useState} from 'react';
import {ScrollingContentView} from '../Content/ScrollingContentView';
import {useForumCategoryPinnedThreadsQuery, useForumCategoryQuery} from '../../Queries/Forum/ForumCategoryQueries';
import {RefreshControl, View} from 'react-native';
import {LoadingView} from '../Static/LoadingView';
import {Text} from 'react-native-paper';
import {useTwitarr} from '../../Context/Contexts/TwitarrContext';
import {PaddedContentView} from '../Content/PaddedContentView';
import {ForumListDataActions} from '../../Reducers/Forum/ForumListDataReducer';
import {ForumThreadFlatList} from '../../Lists/Forums/ForumThreadFlatList';
import {useFilter} from '../../Context/Contexts/FilterContext';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext';
import {ListTitleView} from '../ListTitleView';
import {ForumNewFAB} from '../../Buttons/FloatingActionButtons/ForumNewFAB';
import {useIsFocused} from '@react-navigation/native';

interface ForumCategoryBaseViewProps {
  categoryID: string;
}

export const ForumThreadsCategoryView = (props: ForumCategoryBaseViewProps) => {
  const {forumSortOrder} = useFilter();
  const {
    data,
    refetch,
    hasPreviousPage,
    fetchPreviousPage,
    isFetchingPreviousPage,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isRefetching,
    isLoading,
  } = useForumCategoryQuery(props.categoryID, {
    ...(forumSortOrder ? {sort: forumSortOrder} : undefined),
  });
  const {
    data: pinnedThreads,
    refetch: refetchPins,
    isRefetching: isRefetchingPins,
    isLoading: isLoadingPins,
  } = useForumCategoryPinnedThreadsQuery(props.categoryID);
  const [refreshing, setRefreshing] = useState(false);
  const {forumListData, dispatchForumListData} = useTwitarr();
  const [isUserRestricted, setIsUserRestricted] = useState(false);
  const {hasModerator} = usePrivilege();
  const isFocused = useIsFocused();

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

  const onRefresh = () => {
    refetch();
    refetchPins();
  };

  useEffect(() => {
    if (data && data.pages && isFocused) {
      dispatchForumListData({
        type: ForumListDataActions.setList,
        threadList: data.pages.flatMap(p => p.forumThreads || []),
      });

      const categoryData = data.pages[0];
      if (hasModerator) {
        setIsUserRestricted(false);
      } else {
        setIsUserRestricted(categoryData.isEventCategory || categoryData.isRestricted);
      }
    }
  }, [data, dispatchForumListData, hasModerator, isFocused]);

  // Refresh if user goes back to the category so that it triggers the useEffect above to
  // load the correct list data. Theres a race condition because the effect above wants
  // to set the list to the query data result, but the query is now out of date.
  useEffect(() => {
    if (isFocused && data && data.pages[0].numThreads !== forumListData.length) {
      setRefreshing(true);
      refetchPins();
      refetch().then(() => setRefreshing(false));
    }
  }, [isFocused, data, forumListData, refetch, refetchPins]);

  if (isLoading || isLoadingPins) {
    return <LoadingView />;
  }

  if (data?.pages[0].numThreads === 0 && forumListData.length === 0) {
    return (
      <>
        <View>
          <ScrollingContentView
            isStack={true}
            refreshControl={
              <RefreshControl refreshing={refreshing || isRefetching || isRefetchingPins} onRefresh={onRefresh} />
            }>
            <PaddedContentView padTop={true}>
              <Text>There aren't any forums in this category yet.</Text>
            </PaddedContentView>
          </ScrollingContentView>
        </View>
        {!isUserRestricted && <ForumNewFAB categoryId={props.categoryID} />}
      </>
    );
  }

  return (
    <>
      <ListTitleView title={data?.pages[0].title} />
      <ForumThreadFlatList
        forumListData={forumListData}
        handleLoadNext={handleLoadNext}
        handleLoadPrevious={handleLoadPrevious}
        refreshControl={
          <RefreshControl refreshing={refreshing || isRefetching || isRefetchingPins} onRefresh={onRefresh} />
        }
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
        pinnedThreads={pinnedThreads}
        categoryID={props.categoryID}
      />
      {!isUserRestricted && <ForumNewFAB categoryId={props.categoryID} />}
    </>
  );
};
