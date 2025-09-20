import React, {useRef, useState} from 'react';
import {RefreshControl} from 'react-native';
import {FezData} from '../../Libraries/Structs/ControllerStructs.tsx';
import {TimeDivider} from '../Lists/Dividers/TimeDivider.tsx';
import {ScheduleFlatList} from '../Lists/Schedule/ScheduleFlatList.tsx';
import {FlashList} from '@shopify/flash-list';
import {useLfgListQuery} from '../Queries/Fez/FezQueries.ts';
import {SearchBarBase} from './SearchBarBase.tsx';
import {FezListEndpoints} from '../../Libraries/Types/index.ts';
import {useFilter} from '../Context/Contexts/FilterContext.ts';

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
