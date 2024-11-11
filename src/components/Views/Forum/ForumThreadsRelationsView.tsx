import React, {useEffect, useState} from 'react';
import {LoadingView} from '../Static/LoadingView';
import {ForumSort} from '../../../libraries/Enums/ForumSortFilter';
import {useFilter} from '../../Context/Contexts/FilterContext';
import {ForumRelationQueryType, useForumRelationQuery} from '../../Queries/Forum/ForumThreadRelationQueries';
import {NotLoggedInView} from '../Static/NotLoggedInView';
import {useAuth} from '../../Context/Contexts/AuthContext';
import {ForumListData} from '../../../libraries/Structs/ControllerStructs';
import {ForumEmptyListView} from './ForumEmptyListView.tsx';
import {ForumThreadListView} from './ForumThreadListView.tsx';

interface ForumThreadsRelationsViewProps {
  relationType: ForumRelationQueryType;
  categoryID?: string;
  title?: string;
}
export const ForumThreadsRelationsView = ({relationType, categoryID, title}: ForumThreadsRelationsViewProps) => {
  const {forumSortOrder, forumSortDirection} = useFilter();
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
  } = useForumRelationQuery(relationType, {
    ...(categoryID ? {cat: categoryID} : undefined),
    ...(forumSortOrder && forumSortOrder !== ForumSort.event ? {sort: forumSortOrder} : undefined),
    ...(forumSortDirection ? {order: forumSortDirection} : undefined),
  });
  const [refreshing, setRefreshing] = useState(false);
  const [forumListData, setForumListData] = useState<ForumListData[]>([]);
  const {isLoggedIn} = useAuth();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  useEffect(() => {
    if (data && data.pages) {
      setForumListData(data.pages.flatMap(p => p.forumThreads || []));
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
    return <ForumEmptyListView refreshing={refreshing} onRefresh={onRefresh} />;
  }

  return (
    <ForumThreadListView
      fetchPreviousPage={fetchPreviousPage}
      fetchNextPage={fetchNextPage}
      hasPreviousPage={hasPreviousPage}
      hasNextPage={hasNextPage}
      forumListData={forumListData}
      categoryID={categoryID}
      isFetchingPreviousPage={isFetchingPreviousPage}
      title={title}
      isFetchingNextPage={isFetchingNextPage}
      refreshing={refreshing}
      onRefresh={onRefresh}
      setRefreshing={setRefreshing}
      enableFAB={false}
    />
  );
};
