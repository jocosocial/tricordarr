import React, {useCallback, useEffect, useState} from 'react';
import {ScrollingContentView} from '../Content/ScrollingContentView';
import {useForumCategoryQuery} from '../../Queries/Forum/ForumCategoryQueries';
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
    isLoading,
    hasPreviousPage,
    fetchPreviousPage,
    isFetchingPreviousPage,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useForumCategoryQuery(props.categoryID, {
    ...(forumSortOrder ? {sort: forumSortOrder} : undefined),
  });
  const [refreshing, setRefreshing] = useState(false);
  const {forumListData, dispatchForumListData} = useTwitarr();
  const [isUserRestricted, setIsUserRestricted] = useState(false);
  const {hasModerator} = usePrivilege();
  const isFocused = useIsFocused();

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
      refetch().then(() => setRefreshing(false));
    }
  }, [isFocused, data, forumListData, refetch]);

  if (!data) {
    return <LoadingView />;
  }

  if (data.pages[0].numThreads === 0 && forumListData.length === 0) {
    return (
      <>
        <View>
          <ScrollingContentView
            isStack={true}
            refreshControl={<RefreshControl refreshing={refreshing || isLoading} onRefresh={onRefresh} />}>
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
      <ListTitleView title={data.pages[0].title} />
      <ForumThreadFlatList
        forumListData={forumListData}
        handleLoadNext={handleLoadNext}
        handleLoadPrevious={handleLoadPrevious}
        refreshControl={<RefreshControl refreshing={refreshing || isLoading} onRefresh={onRefresh} />}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
      />
      {!isUserRestricted && <ForumNewFAB categoryId={props.categoryID} />}
    </>
  );
};
