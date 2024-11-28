import {ConversationFlatList} from '../ConversationFlatList.tsx';
import React, {ReactElement, useCallback} from 'react';
import {FlatList, RefreshControlProps, StyleSheet} from 'react-native';
import {EventData, FezData, PersonalEventData} from '../../../libraries/Structs/ControllerStructs.tsx';
import {TimeDivider} from '../Dividers/TimeDivider.tsx';
import {SpaceDivider} from '../Dividers/SpaceDivider.tsx';
import {getDayMarker, getTimeMarker} from '../../../libraries/DateTime.ts';
import {getScheduleListTimeSeparatorID} from '../../../libraries/Schedule.ts';
import {ScheduleFlatListSeparator} from '../../../libraries/Types';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';
import {LoadingNextFooter} from '../Footers/LoadingNextFooter.tsx';

interface ScheduleFlatListBaseProps<TItem> {
  flatListRef: React.RefObject<FlatList<TItem>>;
  renderItem: ({item}: {item: TItem}) => ReactElement;
  items: TItem[];
  keyExtractor: (item: TItem) => string;
  separator?: ScheduleFlatListSeparator;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  onScrollThreshold?: (condition: boolean) => void;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
  handleLoadPrevious?: () => void;
  handleLoadNext?: () => void;
}

export const ScheduleFlatListBase = <TItem extends FezData | PersonalEventData | EventData>({
  flatListRef,
  renderItem,
  items,
  keyExtractor,
  separator,
  refreshControl,
  onScrollThreshold,
  hasPreviousPage,
  hasNextPage,
  handleLoadPrevious,
  handleLoadNext,
}: ScheduleFlatListBaseProps<TItem>) => {
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    flatList: {
      ...commonStyles.paddingHorizontalSmall,
    },
  });

  const renderListHeader = useCallback(() => {
    if (!items[0]) {
      return <TimeDivider label={'No items to display'} />;
    }
    const firstItem = items[0];
    if (!firstItem.startTime || !firstItem.timeZoneID) {
      return <SpaceDivider />;
    }

    let label = getTimeMarker(firstItem.startTime, firstItem.timeZoneID);
    if (separator === 'day') {
      label = getDayMarker(firstItem.startTime, firstItem.timeZoneID);
    }
    return <TimeDivider label={label} />;
  }, [items, separator]);

  const renderListFooter = useCallback(() => {
    if (items.length === 0) {
      return <></>;
    }
    if (hasNextPage) {
      return <LoadingNextFooter />;
    }
    return <TimeDivider />;
  }, [hasNextPage, items.length]);

  const renderSeparatorTime = useCallback(
    ({leadingItem}: {leadingItem: TItem}) => {
      const leadingIndex = items.indexOf(leadingItem);
      if (leadingIndex === undefined) {
        return <TimeDivider label={'Leading Unknown?'} />;
      }
      const trailingIndex = leadingIndex + 1;
      const trailingItem = items[trailingIndex];
      if (!leadingItem.startTime || !trailingItem.startTime || !trailingItem.timeZoneID) {
        return <SpaceDivider />;
      }
      const leadingDate = new Date(leadingItem.startTime);
      const trailingDate = new Date(trailingItem.startTime);
      const leadingTimeMarker = getScheduleListTimeSeparatorID(leadingDate);
      const trailingTimeMarker = getScheduleListTimeSeparatorID(trailingDate);
      if (leadingTimeMarker === trailingTimeMarker) {
        return <SpaceDivider />;
      }
      return <TimeDivider label={getTimeMarker(trailingItem.startTime, trailingItem.timeZoneID)} />;
    },
    [items],
  );

  // FlashList skips separator when paginating.
  // https://github.com/Shopify/flash-list/issues/633
  const renderSeparatorDay = useCallback(
    ({leadingItem}: {leadingItem: TItem}) => {
      const leadingIndex = items.indexOf(leadingItem);
      if (leadingIndex === undefined) {
        return <TimeDivider label={'Leading Unknown?'} />;
      }
      const trailingIndex = leadingIndex + 1;
      const trailingItem = items[trailingIndex];
      if (!leadingItem.startTime || !trailingItem.startTime || !trailingItem.timeZoneID) {
        return <SpaceDivider />;
      }
      const leadingDate = new Date(leadingItem.startTime);
      const trailingDate = new Date(trailingItem.startTime);
      const leadingTimeMarker = leadingDate.getDay();
      const trailingTimeMarker = trailingDate.getDay();
      if (leadingTimeMarker === trailingTimeMarker) {
        return <SpaceDivider />;
      }
      return <TimeDivider label={getDayMarker(trailingItem.startTime, trailingItem.timeZoneID)} />;
    },
    [items],
  );

  const renderSeparatorNone = useCallback(() => <SpaceDivider />, []);

  let ItemSeparatorComponent = renderSeparatorTime;
  switch (separator) {
    case 'day':
      ItemSeparatorComponent = renderSeparatorDay;
      break;
    case 'none':
      ItemSeparatorComponent = renderSeparatorNone;
  }

  return (
    <ConversationFlatList
      flatListRef={flatListRef}
      renderItem={renderItem}
      data={items}
      keyExtractor={keyExtractor}
      renderItemSeparator={ItemSeparatorComponent}
      renderListHeader={renderListHeader}
      renderListFooter={renderListFooter}
      refreshControl={refreshControl}
      onScrollThreshold={onScrollThreshold}
      handleLoadNext={handleLoadNext}
      handleLoadPrevious={handleLoadPrevious}
      hasNextPage={hasNextPage}
      hasPreviousPage={hasPreviousPage}
      listStyle={styles.flatList}
      enableScrollButton={false}
    />
  );
};
