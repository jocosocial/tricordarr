import React, {Dispatch, SetStateAction, useState} from 'react';
import {RefreshControl} from 'react-native';
import {SelectionButtons} from '../../Buttons/SegmentedButtons/SelectionButtons.tsx';
import {
  CategoryData,
  ErrorResponse,
  ForumListData,
  ForumSearchData,
} from '../../../libraries/Structs/ControllerStructs.tsx';
import {ListTitleView} from '../ListTitleView.tsx';
import {ForumThreadFlatList} from '../../Lists/Forums/ForumThreadFlatList.tsx';
import {ForumCategoryFAB} from '../../Buttons/FloatingActionButtons/ForumCategoryFAB.tsx';
import {useSelection} from '../../Context/Contexts/SelectionContext.ts';
import {FetchNextPageOptions, InfiniteQueryObserverResult} from '@tanstack/react-query';
import {CategoryDataQueryResponse} from '../../Queries/Forum/ForumCategoryQueries.tsx';
import {AxiosError} from 'axios';

interface ForumThreadListViewProps {
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  enableFAB?: boolean;
  category?: CategoryData;
  setRefreshing: Dispatch<SetStateAction<boolean>>;
  fetchNextPage: (
    options?: FetchNextPageOptions | undefined,
  ) => Promise<
    InfiniteQueryObserverResult<CategoryDataQueryResponse | ForumSearchData, AxiosError<ErrorResponse, any>>
  >;
  fetchPreviousPage: (
    options?: FetchNextPageOptions | undefined,
  ) => Promise<
    InfiniteQueryObserverResult<CategoryDataQueryResponse | ForumSearchData, AxiosError<ErrorResponse, any>>
  >;
  isFetchingNextPage: boolean;
  isFetchingPreviousPage: boolean;
  title?: string;
  refreshing: boolean;
  onRefresh: () => void;
  forumListData: ForumListData[];
  subtitle?: string;
}

export const ForumThreadListView = ({
  hasNextPage,
  hasPreviousPage,
  enableFAB = false,
  category,
  setRefreshing,
  fetchNextPage,
  fetchPreviousPage,
  isFetchingNextPage,
  isFetchingPreviousPage,
  title,
  refreshing,
  onRefresh,
  forumListData,
  subtitle,
}: ForumThreadListViewProps) => {
  const {enableSelection} = useSelection();
  const [showFabLabel, setShowFabLabel] = useState(true);
  const onScrollThreshold = (hasScrolled: boolean) => setShowFabLabel(!hasScrolled);

  const handleLoadNext = () => {
    if (!isFetchingNextPage && hasNextPage) {
      setRefreshing(true);
      fetchNextPage().finally(() => setRefreshing(false));
    }
  };
  const handleLoadPrevious = () => {
    if (!isFetchingPreviousPage && hasPreviousPage) {
      setRefreshing(true);
      fetchPreviousPage().finally(() => setRefreshing(false));
    }
  };

  return (
    <>
      {enableSelection ? (
        <SelectionButtons items={forumListData} />
      ) : (
        <ListTitleView title={title} subtitle={subtitle} />
      )}
      <ForumThreadFlatList
        forumListData={forumListData}
        handleLoadNext={handleLoadNext}
        handleLoadPrevious={handleLoadPrevious}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
        categoryID={category?.categoryID}
        onScrollThreshold={onScrollThreshold}
      />
      {enableFAB && category && <ForumCategoryFAB category={category} showLabel={showFabLabel} />}
    </>
  );
};
