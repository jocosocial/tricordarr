import {FlashList} from '@shopify/flash-list';
import React, {useEffect, useRef, useState} from 'react';

import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {ScheduleFlatList} from '#src/Components/Lists/Schedule/ScheduleFlatList';
import {SearchBarBase} from '#src/Components/Search/SearchBarBase';
import {useFilter} from '#src/Context/Contexts/FilterContext';
import {useSafePagination} from '#src/Hooks/useSafePagination';
import {useLfgListQuery} from '#src/Queries/Fez/FezQueries';
import {FezData} from '#src/Structs/ControllerStructs';
import {FezListEndpoints} from '#src/Types';

interface LFGSearchBarProps {
  endpoint: FezListEndpoints;
}

export const LFGSearchBar = ({endpoint}: LFGSearchBarProps) => {
  const [queryEnable, setQueryEnable] = useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const {lfgHidePastFilter} = useFilter();
  const {data, refetch, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage} = useLfgListQuery({
    search: searchQuery,
    hidePast: lfgHidePastFilter,
    options: {
      enabled: queryEnable,
    },
    endpoint: endpoint,
  });
  const listRef = useRef<FlashList<FezData>>(null);
  const [lfgList, setLfgList] = useState<FezData[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const onChangeSearch = (query: string) => {
    if (query !== searchQuery) {
      setQueryEnable(false);
    }
    setSearchQuery(query);
  };

  const onSearch = () => {
    setQueryEnable(true);
  };

  const onRefresh = () => {
    setRefreshing(true);
    refetch().then(() => setRefreshing(false));
  };

  const {safeHandleLoadNext, effectiveHasNextPage} = useSafePagination({
    searchQuery,
    minLength: 3,
    hasNextPage: hasNextPage ?? false,
    itemsLength: lfgList.length,
    fetchNextPage: () => {
      if (!isFetchingNextPage && queryEnable) {
        setRefreshing(true);
        fetchNextPage().finally(() => setRefreshing(false));
      }
    },
  });

  useEffect(() => {
    if (data && queryEnable) {
      let fezDataList: FezData[] = [];
      data.pages.map(page => {
        fezDataList = fezDataList.concat(page.fezzes);
      });
      setLfgList(fezDataList);
    } else {
      setLfgList([]);
    }
  }, [data, queryEnable]);

  return (
    <>
      <SearchBarBase searchQuery={searchQuery} onSearch={onSearch} onChangeSearch={onChangeSearch} />
      <ScheduleFlatList
        listRef={listRef}
        items={lfgList}
        refreshControl={
          <AppRefreshControl refreshing={isFetching || refreshing} onRefresh={onRefresh} enabled={!!searchQuery} />
        }
        separator={'day'}
        handleLoadNext={safeHandleLoadNext}
        hasNextPage={effectiveHasNextPage}
      />
    </>
  );
};
