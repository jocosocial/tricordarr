import React, {useEffect, useState} from 'react';
import {LoadingView} from '../Static/LoadingView.tsx';
import {ForumSort} from '../../../Libraries/Enums/ForumSortFilter.ts';
import {useFilter} from '../../Context/Contexts/FilterContext.ts';
import {ForumRelationQueryType, useForumRelationQuery} from '../../Queries/Forum/ForumThreadRelationQueries.ts';
import {NotLoggedInView} from '../Static/NotLoggedInView.tsx';
import {useAuth} from '../../Context/Contexts/AuthContext.ts';
import {CategoryData, ForumListData} from '../../../Libraries/Structs/ControllerStructs.tsx';
import {ForumEmptyListView} from './ForumEmptyListView.tsx';
import {ForumThreadListView} from './ForumThreadListView.tsx';
import pluralize from 'pluralize';

interface ForumThreadsRelationsViewProps {
  relationType: ForumRelationQueryType;
  category?: CategoryData;
  title?: string;
}
export const ForumThreadsRelationsView = ({relationType, category, title}: ForumThreadsRelationsViewProps) => {
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
    ...(category ? {cat: category.categoryID} : undefined),
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

  if (isLoading || !data) {
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
      category={category}
      isFetchingPreviousPage={isFetchingPreviousPage}
      title={title}
      isFetchingNextPage={isFetchingNextPage}
      refreshing={refreshing}
      onRefresh={onRefresh}
      setRefreshing={setRefreshing}
      enableFAB={false}
      subtitle={`${data.pages[0].paginator.total} ${pluralize('forum', data.pages[0].paginator.total)}`}
    />
  );
};
