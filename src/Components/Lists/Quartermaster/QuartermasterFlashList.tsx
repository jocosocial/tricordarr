import {type FlashListRef} from '@shopify/flash-list';
import React, {forwardRef, useCallback} from 'react';
import {RefreshControlProps, View} from 'react-native';

import {AppFlashList} from '#src/Components/Lists/AppFlashList';
import {EndResultsFooter} from '#src/Components/Lists/Footers/EndResultsFooter';
import {LoadingNextFooter} from '#src/Components/Lists/Footers/LoadingNextFooter';
import {NoResultsFooter} from '#src/Components/Lists/Footers/NoResultsFooter';
import {QuartermasterListItem} from '#src/Components/Lists/Items/Quartermaster/QuartermasterListItem';
import {QuartermasterData} from '#src/Structs/ControllerStructs';

interface QuartermasterFlashListProps {
  items: QuartermasterData[];
  refreshControl?: React.ReactElement<RefreshControlProps>;
  handleLoadNext?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  renderListHeader?: React.ComponentType<any>;
  /** Anchor the scroll buttons above a bottom-right FAB. */
  scrollButtonRaised?: boolean;
}

/**
 * List of Quartermastarr item rows with the standard loading, empty and end-of-list footers.
 */
const QuartermasterFlashListInner = (
  {
    items,
    refreshControl,
    handleLoadNext,
    hasNextPage,
    isFetchingNextPage,
    renderListHeader,
    scrollButtonRaised,
  }: QuartermasterFlashListProps,
  ref: React.ForwardedRef<FlashListRef<QuartermasterData>>,
) => {
  const renderItem = useCallback(({item}: {item: QuartermasterData}) => <QuartermasterListItem item={item} />, []);

  const keyExtractor = useCallback((item: QuartermasterData) => item.itemID, []);

  const renderListFooter = useCallback(() => {
    if (isFetchingNextPage) {
      return <LoadingNextFooter />;
    }
    if (items.length === 0) {
      return <NoResultsFooter />;
    }
    if (!hasNextPage) {
      return <EndResultsFooter />;
    }
    return <View />;
  }, [isFetchingNextPage, items.length, hasNextPage]);

  return (
    <AppFlashList<QuartermasterData>
      ref={ref}
      renderItem={renderItem}
      data={items}
      keyExtractor={keyExtractor}
      handleLoadNext={handleLoadNext}
      refreshControl={refreshControl}
      renderListHeader={renderListHeader}
      renderListFooter={renderListFooter}
      scrollButtonRaised={scrollButtonRaised}
    />
  );
};

/**
 * List of Quartermastarr item rows with the standard loading, empty, and end-of-results footers.
 */
export const QuartermasterFlashList = forwardRef(QuartermasterFlashListInner) as (
  props: QuartermasterFlashListProps & {ref?: React.ForwardedRef<FlashListRef<QuartermasterData>>},
) => ReturnType<typeof QuartermasterFlashListInner>;
