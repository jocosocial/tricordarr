import React, {useEffect, useState} from 'react';
import {Searchbar} from 'react-native-paper';
import {useErrorHandler} from '../Context/Contexts/ErrorHandlerContext';
import {useStyles} from '../Context/Contexts/StyleContext';
import {FezData} from '../../libraries/Structs/ControllerStructs';
import {useSeamailListQuery} from '../Queries/Fez/FezQueries';
import {Keyboard, RefreshControl, View} from 'react-native';
import {SeamailFlatList} from '../Lists/Seamail/SeamailFlatList';

export const SeamailSearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const {setErrorMessage} = useErrorHandler();
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
      setErrorMessage('Search string must be >2 characters');
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
    if (data) {
      let fezDataList: FezData[] = [];
      data.pages.map(page => {
        fezDataList = fezDataList.concat(page.fezzes);
      });
      setFezList(fezDataList);
    }
  }, [data]);

  return (
    <View>
      <Searchbar
        placeholder={'Search seamail messages'}
        onIconPress={onSearch}
        onChangeText={onChangeSearch}
        value={searchQuery}
        onSubmitEditing={onSearch}
        onClearIconPress={onClear}
        style={[commonStyles.marginBottomSmall, commonStyles.marginHorizontal]}
      />
      <SeamailFlatList
        fezList={fezList}
        refreshControl={<RefreshControl refreshing={isFetching || refreshing} onRefresh={onRefresh} />}
        onEndReached={handleLoadNext}
      />
    </View>
  );
};
