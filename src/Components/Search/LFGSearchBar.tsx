import {type FlashListRef} from '@shopify/flash-list';
import React, {useEffect, useRef, useState} from 'react';

import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {ScheduleFlatList} from '#src/Components/Lists/Schedule/ScheduleFlatList';
import {SearchBarBase} from '#src/Components/Search/SearchBarBase';
import {useLfgFilter} from '#src/Context/Contexts/LfgFilterContext';
import {useRefresh} from '#src/Hooks/useRefresh';
import {useSafePagination} from '#src/Hooks/useSafePagination';
import {useLfgSourceQuery} from '#src/Queries/Fez/LfgListQueries';
import {FezData} from '#src/Structs/ControllerStructs';
import {LfgListEndpoint} from '#src/Types';

interface LFGSearchBarProps {
  endpoint: LfgListEndpoint;
}

export const LFGSearchBar = ({endpoint}: LFGSearchBarProps) => {
  const [queryEnable, setQueryEnable] = useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const {lfgHidePastFilter, lfgCancelledFilter} = useLfgFilter();
  const {fezzes, refetch, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage} = useLfgSourceQuery({
    search: searchQuery,
    hidePast: lfgHidePastFilter,
    cancelledOnly: endpoint !== 'former' && lfgCancelledFilter,
    enabled: queryEnable,
    endpoint: endpoint,
  });
  const listRef = useRef<FlashListRef<FezData>>(null);
  const [lfgList, setLfgList] = useState<FezData[]>([]);
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

  const {safeHandleLoadNext, effectiveHasNextPage} = useSafePagination({
    searchQuery,
    minLength: 3,
    hasNextPage: hasNextPage ?? false,
    itemsLength: lfgList.length,
    fetchNextPage: () => {
      if (!isFetchingNextPage && queryEnable) {
        setRefreshing(true);
        void fetchNextPage().finally(() => setRefreshing(false));
      }
    },
  });

  useEffect(() => {
    if (queryEnable) {
      setLfgList(fezzes);
    } else {
      setLfgList([]);
    }
  }, [fezzes, queryEnable]);

  return (
    <>
      <SearchBarBase
        testID={'lfgSearch-input'}
        searchQuery={searchQuery}
        onSearch={onSearch}
        onChangeSearch={onChangeSearch}
        loading={isFetching && !isFetchingNextPage}
      />
      <ScheduleFlatList
        listRef={listRef}
        items={lfgList}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} enabled={!!searchQuery} />}
        separator={'day'}
        handleLoadNext={safeHandleLoadNext}
        hasNextPage={effectiveHasNextPage}
      />
    </>
  );
};
