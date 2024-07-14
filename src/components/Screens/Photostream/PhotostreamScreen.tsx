import React, {useCallback, useState} from 'react';
import {AppView} from '../../Views/AppView.tsx';
import {usePhotostreamQuery} from '../../Queries/Photostream/PhotostreamQueries.tsx';
import {PhotostreamImageData} from '../../../libraries/Structs/ControllerStructs.tsx';
import {FlatList, RefreshControl} from 'react-native';
import {PhotostreamListItem} from '../../Lists/Items/PhotostreamListItem.tsx';
import {PhotostreamFAB} from '../../Buttons/FloatingActionButtons/PhotostreamFAB.tsx';

export const PhotostreamScreen = () => {
  const {data, refetch, isFetchingNextPage, hasNextPage, fetchNextPage, isRefetching, isFetched, isLoading} = usePhotostreamQuery();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleLoadNext = () => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  };

  const streamList = data?.pages.flatMap(p => p.photos);

  return (
    <AppView>
      <FlatList
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={handleLoadNext}
        keyExtractor={(item: PhotostreamImageData) => item.postID.toString()}
        data={streamList}
        renderItem={({item}) => <PhotostreamListItem item={item} />}
        onEndReachedThreshold={5}
      />
      <PhotostreamFAB />
    </AppView>
  );
};
