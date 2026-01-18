import React, {useEffect, useState} from 'react';
import {Keyboard} from 'react-native';

import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {SeamailFlatList} from '#src/Components/Lists/Fez/SeamailFlatList';
import {SearchBarBase, useSafePagination} from '#src/Components/Search/SearchBarBase';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useSeamailListQuery} from '#src/Queries/Fez/FezQueries';
import {FezData} from '#src/Structs/ControllerStructs';

export const SeamailSearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [queryEnable, setQueryEnable] = useState(false);
  const {data, refetch, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage} = useSeamailListQuery({
    search: searchQuery,
    options: {
      enabled: queryEnable,
    },
  });
  const {commonStyles} = useStyles();
  const [fezList, setFezList] = useState<FezData[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const onChangeSearch = (query: string) => {
    setSearchQuery(query);
    setQueryEnable(false);
  };
  const onClear = () => {
    setFezList([]);
    setQueryEnable(false);
  };
  const onSearch = () => {
    setQueryEnable(true);
    refetch();
    Keyboard.dismiss();
  };

  const {safeHandleLoadNext} = useSafePagination({
    searchQuery,
    minLength: 3,
    hasNextPage: hasNextPage ?? false,
    itemsLength: fezList.length,
    fetchNextPage: () => {
      if (!isFetchingNextPage && queryEnable) {
        setRefreshing(true);
        fetchNextPage().finally(() => setRefreshing(false));
      }
    },
  });

  const onRefresh = () => {
    setRefreshing(true);
    refetch().then(() => setRefreshing(false));
  };

  useEffect(() => {
    if (data && queryEnable) {
      let fezDataList: FezData[] = [];
      data.pages.map(page => {
        fezDataList = fezDataList.concat(page.fezzes);
      });
      setFezList(fezDataList);
    }
  }, [data, queryEnable]);

  return (
    <>
      <SearchBarBase
        placeholder={'Search seamail messages'}
        onSearch={onSearch}
        onChangeSearch={onChangeSearch}
        searchQuery={searchQuery}
        onClear={onClear}
        style={commonStyles.marginBottom}
      />
      <SeamailFlatList
        fezList={fezList}
        refreshControl={<AppRefreshControl refreshing={isFetching || refreshing} onRefresh={onRefresh} />}
        onEndReached={safeHandleLoadNext}
      />
    </>
  );
};
