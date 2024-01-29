import React, {useEffect, useState} from 'react';
import {ScrollingContentView} from '../Content/ScrollingContentView';
import {RefreshControl, View} from 'react-native';
import {LoadingView} from '../Static/LoadingView';
import {Text} from 'react-native-paper';
import {PaddedContentView} from '../Content/PaddedContentView';
import {ForumThreadFlatList} from '../../Lists/Forums/ForumThreadFlatList';
import {ForumSortOrder} from '../../../libraries/Enums/ForumSortFilter';
import {useFilter} from '../../Context/Contexts/FilterContext';
import {ForumRelationQueryType, useForumRelationQuery} from '../../Queries/Forum/ForumThreadRelationQueries';
import {NotLoggedInView} from '../Static/NotLoggedInView';
import {useAuth} from '../../Context/Contexts/AuthContext';
import {NoResultsView} from '../Static/NoResultsView';
import {AppView} from '../AppView';
import {ForumListData} from '../../../libraries/Structs/ControllerStructs';

export const ForumThreadsRelationsView = ({
  relationType,
  categoryID,
}: {
  relationType: ForumRelationQueryType;
  categoryID?: string;
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
    isFetched,
  } = useForumRelationQuery(relationType, {
    ...(categoryID ? {cat: categoryID} : undefined),
    ...(forumSortOrder && forumSortOrder !== ForumSortOrder.event ? {sort: forumSortOrder} : undefined),
  });
  const [refreshing, setRefreshing] = useState(false);
  const [forumListData, setForumListData] = useState<ForumListData[]>([]);
  const {isLoggedIn} = useAuth();

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
      setForumListData(data.pages.flatMap(p => p.forumThreads || []))
    }
  }, [data, setForumListData]);

  if (!isLoggedIn) {
    return <NotLoggedInView />;
  }

  if (isLoading) {
    return <LoadingView />;
  }

  // Don't use the state list because it renders too quickly.
  if (data && data.pages[0].forumThreads.length === 0) {
    return (
      <View>
        <ScrollingContentView
          isStack={true}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
          <PaddedContentView padTop={true}>
            <Text>There aren't any forums matching these filters.</Text>
          </PaddedContentView>
        </ScrollingContentView>
      </View>
    );
  }

  return (
    <AppView>
      {isFetched && forumListData.length === 0 && <NoResultsView />}
      <ForumThreadFlatList
        forumListData={forumListData}
        handleLoadNext={handleLoadNext}
        handleLoadPrevious={handleLoadPrevious}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
      />
    </AppView>
  );
};
