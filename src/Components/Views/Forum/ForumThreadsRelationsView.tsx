import pluralize from 'pluralize';
import React, {useEffect, useState} from 'react';

import {ForumEmptyListView} from '#src/Components/Views/Forum/ForumEmptyListView';
import {ForumThreadListView} from '#src/Components/Views/Forum/ForumThreadListView';
import {LoadingView} from '#src/Components/Views/Static/LoadingView';
import {useForumFilter} from '#src/Context/Contexts/ForumFilterContext';
import {ForumSort} from '#src/Enums/ForumSortFilter';
import {useRefresh} from '#src/Hooks/useRefresh';
import {ForumRelationQueryType, useForumRelationQuery} from '#src/Queries/Forum/ForumThreadRelationQueries';
import {CategoryData, ForumListData} from '#src/Structs/ControllerStructs';

interface Props {
  relationType: ForumRelationQueryType;
  category?: CategoryData;
  title?: string;
  onDataChange?: (data: ForumListData[]) => void;
}

/**
 * View for lists of forum threads where the user has a relation to them. Examples:
 * All of your Favorites/Muted/Unread/Owned threads.
 *
 * Also used when a filter is being applied to a list of threads within a category.
 * Example: "Favorites in the "General" category"
 */
export const ForumThreadsRelationsView = ({relationType, category, title, onDataChange}: Props) => {
  const {forumSortOrder, forumSortDirection} = useForumFilter();
  const {
    data,
    refetch,
    isLoading,
    isFetching,
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
  const {refreshing, setRefreshing, onRefresh} = useRefresh({
    refresh: refetch,
    isRefreshing: isFetching,
  });
  const [forumListData, setForumListData] = useState<ForumListData[]>([]);

  useEffect(() => {
    if (data && data.pages) {
      const list = data.pages.flatMap(p => p.forumThreads || []);
      setForumListData(list);
      onDataChange?.(list);
    }
  }, [data, onDataChange]);

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
