import {type FlashListRef} from '@shopify/flash-list';
import React, {useMemo, useRef, useState} from 'react';

import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {PerformerFlashList} from '#src/Components/Lists/Performer/PerformerFlashList';
import {SearchBarBase} from '#src/Components/Search/SearchBarBase';
import {useRefresh} from '#src/Hooks/useRefresh';
import {useSafePagination} from '#src/Hooks/useSafePagination';
import {PerformerType, usePerformersQuery} from '#src/Queries/Performer/PerformerQueries';
import {PerformerHeaderData} from '#src/Structs/ControllerStructs';

interface PerformerSearchBarProps {
  performerType: PerformerType;
}

/**
 * Search bar and results list for the official or shadow performer list. The
 * query only runs once the user submits a search (search icon or keyboard
 * return), matching the other search bars in the app.
 */
export const PerformerSearchBar = ({performerType}: PerformerSearchBarProps) => {
  const [queryEnable, setQueryEnable] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const {data, refetch, isFetching, fetchNextPage, hasNextPage, isFetchingNextPage} = usePerformersQuery({
    performerType: performerType,
    search: searchQuery,
    options: {
      enabled: queryEnable,
    },
  });
  const listRef = useRef<FlashListRef<PerformerHeaderData>>(null);
  const {refreshing, setRefreshing, onRefresh} = useRefresh({
    refresh: refetch,
    isRefreshing: isFetching,
  });

  const onChangeSearch = (query: string) => {
    if (query !== searchQuery) {
      setQueryEnable(false);
    }
    setSearchQuery(query);
  };

  const onSearch = () => {
    setQueryEnable(true);
  };

  const onClear = () => {
    setQueryEnable(false);
    setSearchQuery('');
  };

  const performers = useMemo(() => {
    if (!data || !queryEnable) {
      return [];
    }
    return data.pages.flatMap(p => p.performers);
  }, [data, queryEnable]);

  // effectiveHasNextPage isn't needed: PerformerFlashList has no next-page footer, and
  // safeHandleLoadNext already refuses to paginate an invalid/empty search.
  const {safeHandleLoadNext} = useSafePagination({
    searchQuery,
    minLength: 3,
    hasNextPage: hasNextPage ?? false,
    itemsLength: performers.length,
    fetchNextPage: () => {
      if (!isFetchingNextPage && queryEnable) {
        setRefreshing(true);
        fetchNextPage().finally(() => setRefreshing(false));
      }
    },
  });

  return (
    <>
      <SearchBarBase
        testID={'performerSearch-input'}
        placeholder={'Search Performers'}
        searchQuery={searchQuery}
        onSearch={onSearch}
        onChangeSearch={onChangeSearch}
        onClear={onClear}
      />
      <PerformerFlashList
        ref={listRef}
        items={performers}
        handleLoadNext={safeHandleLoadNext}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} enabled={!!searchQuery} />}
      />
    </>
  );
};
