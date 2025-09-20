import React, {useEffect, useState} from 'react';
import {useStyles} from '../Context/Contexts/StyleContext.ts';
import {FezData} from '../../Libraries/Structs/ControllerStructs.tsx';
import {useSeamailListQuery} from '../Queries/Fez/FezQueries.ts';
import {Keyboard, RefreshControl} from 'react-native';
import {SeamailFlatList} from '../Lists/Seamail/SeamailFlatList.tsx';
import {SearchBarBase} from './SearchBarBase.tsx';

export const SeamailSearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [queryEnable, setQueryEnable] = useState(false);
  const {data, refetch, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage, remove} = useSeamailListQuery({
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
    remove();
    setQueryEnable(false);
  };
  const onSearch = () => {
    if (!searchQuery || searchQuery.length < 3) {
      setQueryEnable(false);
    } else {
      setQueryEnable(true);
      refetch();
      Keyboard.dismiss();
    }
  };

  const handleLoadNext = () => {
    if (!isFetchingNextPage && hasNextPage && queryEnable) {
      setRefreshing(true);
      fetchNextPage().finally(() => setRefreshing(false));
    }
  };

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
        refreshControl={<RefreshControl refreshing={isFetching || refreshing} onRefresh={onRefresh} />}
        onEndReached={handleLoadNext}
      />
    </>
  );
};
