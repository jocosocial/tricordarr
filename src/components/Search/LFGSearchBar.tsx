import React, {useRef, useState} from 'react';
import {RefreshControl} from 'react-native';
import {FezData} from '#src/Structs/ControllerStructs';
import {TimeDivider} from '#src/Components/Lists/Dividers/TimeDivider';
import {ScheduleFlatList} from '#src/Components/Lists/Schedule/ScheduleFlatList';
import {FlashList} from '@shopify/flash-list';
import {useLfgListQuery} from '#src/Queries/Fez/FezQueries';
import {SearchBarBase} from '#src/Components/Search/SearchBarBase';
import {FezListEndpoints} from '#src/Types';
import {useFilter} from '#src/Context/Contexts/FilterContext';

interface LFGSearchBarProps {
  endpoint: FezListEndpoints;
}

export const LFGSearchBar = ({endpoint}: LFGSearchBarProps) => {
  const [queryEnable, setQueryEnable] = useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const {lfgHidePastFilter} = useFilter();
  const {data, refetch, isFetching, remove} = useLfgListQuery({
    search: searchQuery,
    hidePast: lfgHidePastFilter,
    options: {
      enabled: queryEnable,
    },
    endpoint: endpoint,
  });
  const listRef = useRef<FlashList<FezData>>(null);

  const onChangeSearch = (query: string) => {
    if (query !== searchQuery) {
      setQueryEnable(false);
      remove();
    }
    setSearchQuery(query);
  };
  const onClear = () => remove();

  const onSearch = () => {
    if (!searchQuery || searchQuery.length < 3) {
      setQueryEnable(false);
    } else {
      setQueryEnable(true);
    }
  };

  // Deal with some undefined issues below by defaulting to empty list.
  let lfgList: FezData[] = [];
  searchQuery && data?.pages.map(page => (lfgList = lfgList.concat(page.fezzes)));

  return (
    <>
      <SearchBarBase
        searchQuery={searchQuery}
        onSearch={onSearch}
        onChangeSearch={onChangeSearch}
        onClear={onClear}
        remove={remove}
      />
      <ScheduleFlatList
        listRef={listRef}
        listFooter={<TimeDivider label={'End of Results'} />}
        items={lfgList}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} enabled={!!searchQuery} />}
        separator={'day'}
      />
    </>
  );
};
