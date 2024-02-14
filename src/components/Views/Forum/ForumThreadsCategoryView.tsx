import React, {useEffect, useState} from 'react';
import {ScrollingContentView} from '../Content/ScrollingContentView';
import {useForumCategoryQuery} from '../../Queries/Forum/ForumCategoryQueries';
import {RefreshControl, View} from 'react-native';
import {LoadingView} from '../Static/LoadingView';
import {Text} from 'react-native-paper';
import {PaddedContentView} from '../Content/PaddedContentView';
import {ForumThreadFlatList} from '../../Lists/Forums/ForumThreadFlatList';
import {useFilter} from '../../Context/Contexts/FilterContext';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext';
import {ListTitleView} from '../ListTitleView';
import {ForumNewFAB} from '../../Buttons/FloatingActionButtons/ForumNewFAB';
import {ForumListData} from '../../../libraries/Structs/ControllerStructs';

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
    isLoading,
  } = useForumCategoryQuery(props.categoryID, {
    ...(forumSortOrder ? {sort: forumSortOrder} : undefined),
  });
  const [refreshing, setRefreshing] = useState(false);
  const [forumListData, setForumListData] = useState<ForumListData[]>([]);
  const [isUserRestricted, setIsUserRestricted] = useState(false);
  const {hasModerator} = usePrivilege();

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

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  useEffect(() => {
    if (data && data.pages) {
      setForumListData(data.pages.flatMap(p => p.forumThreads || []));

      const categoryData = data.pages[0];
      if (hasModerator) {
        setIsUserRestricted(false);
      } else {
        setIsUserRestricted(categoryData.isEventCategory || categoryData.isRestricted);
      }
    }
  }, [data, setForumListData, hasModerator]);

  if (isLoading) {
    return <LoadingView />;
  }

  if (data?.pages[0].numThreads === 0 && forumListData.length === 0) {
    return (
      <>
        <View>
          <ScrollingContentView
            isStack={true}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
        categoryID={props.categoryID}
      />
      {!isUserRestricted && <ForumNewFAB categoryId={props.categoryID} />}
    </>
  );
};
