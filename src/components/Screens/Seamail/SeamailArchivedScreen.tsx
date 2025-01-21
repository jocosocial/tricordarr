import {RefreshControl} from 'react-native';
import {SeamailFlatList} from '../../Lists/Seamail/SeamailFlatList.tsx';
import React, {useEffect, useState} from 'react';
import {useSeamailListQuery} from '../../Queries/Fez/FezQueries.ts';
import {FezData} from '../../../libraries/Structs/ControllerStructs.tsx';
import {AppView} from '../../Views/AppView.tsx';

export const SeamailArchivedScreen = () => {
  const {data, refetch, isFetchingNextPage, hasNextPage, fetchNextPage, isFetching} = useSeamailListQuery({
    archived: true,
  });
  const [fezList, setFezList] = useState<FezData[]>([]);

  const handleLoadNext = () => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  };

  useEffect(() => {
    if (data && data.pages) {
      setFezList(data.pages.flatMap(p => p.fezzes));
    }
  }, [data]);

  return (
    <AppView>
      <SeamailFlatList
        fezList={fezList}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        onEndReached={handleLoadNext}
        hasNextPage={hasNextPage}
        handleLoadNext={handleLoadNext}
      />
    </AppView>
  );
};
