import React, {Dispatch, SetStateAction, useState} from 'react';

import {ForumCategoryFAB} from '#src/Components/Buttons/FloatingActionButtons/ForumCategoryFAB';
import {SelectionButtons} from '#src/Components/Buttons/SegmentedButtons/SelectionButtons';
import {AppRefreshControl} from '#src/Components/Controls/AppRefreshControl';
import {ForumThreadList} from '#src/Components/Lists/Forums/ForumThreadList';
import {ListTitleView} from '#src/Components/Views/ListTitleView';
import {useSelection} from '#src/Context/Contexts/SelectionContext';
import {CategoryData, ForumListData} from '#src/Structs/ControllerStructs';

interface ForumThreadListViewProps {
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  enableFAB?: boolean;
  category?: CategoryData;
  setRefreshing: Dispatch<SetStateAction<boolean>>;
  fetchNextPage: () => Promise<unknown>;
  fetchPreviousPage: () => Promise<unknown>;
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
      <ForumThreadList
        forumListData={forumListData}
        handleLoadNext={handleLoadNext}
        handleLoadPrevious={handleLoadPrevious}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
        categoryID={category?.categoryID}
        onScrollThreshold={onScrollThreshold}
      />
      {enableFAB && category && <ForumCategoryFAB category={category} showLabel={showFabLabel} />}
    </>
  );
};
