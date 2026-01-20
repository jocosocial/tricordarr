import {FlashListRef} from '@shopify/flash-list';
import {InfiniteData, UseInfiniteQueryResult} from '@tanstack/react-query';
import {AxiosError} from 'axios';
import React, {ReactNode, useCallback, useMemo, useRef} from 'react';
import {Text} from 'react-native-paper';

import {PhotostreamFAB} from '#src/Components/Buttons/FloatingActionButtons/PhotostreamFAB';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {AppFlashList} from '#src/Components/Lists/AppFlashList';
import {EndResultsFooter} from '#src/Components/Lists/Footers/EndResultsFooter';
import {PhotostreamListItem} from '#src/Components/Lists/Items/PhotostreamListItem';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {usePagination} from '#src/Hooks/usePagination';
import {useRefresh} from '#src/Hooks/useRefresh';
import {PaginationQueryParams} from '#src/Queries/Pagination';
import {ErrorResponse, PhotostreamListData} from '#src/Structs/ControllerStructs';
import {PhotostreamImageData} from '#src/Structs/ControllerStructs';

interface PhotostreamScreenBaseProps {
  queryResult: UseInfiniteQueryResult<
    InfiniteData<PhotostreamListData, PaginationQueryParams>,
    AxiosError<ErrorResponse>
  >;
  titleView?: ReactNode;
  showFAB?: boolean;
  onScrollThreshold?: (condition: boolean) => void;
  flashListRef?: React.RefObject<FlashListRef<PhotostreamImageData> | null>;
}

export const PhotostreamScreenBase = ({
  queryResult,
  titleView,
  showFAB = false,
  onScrollThreshold,
  flashListRef: externalFlashListRef,
}: PhotostreamScreenBaseProps) => {
  const {data, refetch, isFetchingNextPage, hasNextPage, fetchNextPage, isFetching} = queryResult;
  const {refreshing, onRefresh} = useRefresh({refresh: refetch, isRefreshing: isFetching});
  const {handleLoadNext} = usePagination({
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  });
  const internalFlashListRef = useRef<FlashListRef<PhotostreamImageData>>(null);
  const flashListRef = externalFlashListRef || internalFlashListRef;

  const renderItem = useCallback(({item}: {item: PhotostreamImageData}) => <PhotostreamListItem item={item} />, []);
  const keyExtractor = useCallback((item: PhotostreamImageData) => item.postID.toString(), []);

  const streamList = useMemo(() => data?.pages.flatMap(p => p.photos), [data?.pages]);

  if (!streamList || streamList.length === 0) {
    return (
      <AppView>
        <ScrollingContentView
          isStack={!!titleView}
          refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
          {titleView}
          <PaddedContentView padTop={!!titleView}>
            <Text>No photos to display</Text>
          </PaddedContentView>
        </ScrollingContentView>
        {showFAB && <PhotostreamFAB />}
      </AppView>
    );
  }

  return (
    <AppView>
      {titleView}
      <AppFlashList
        ref={flashListRef}
        renderItem={renderItem}
        data={streamList}
        onScrollThreshold={onScrollThreshold}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        handleLoadNext={handleLoadNext}
        keyExtractor={keyExtractor}
        renderListFooter={EndResultsFooter}
      />
      {showFAB && <PhotostreamFAB showLabel={true} />}
    </AppView>
  );
};
