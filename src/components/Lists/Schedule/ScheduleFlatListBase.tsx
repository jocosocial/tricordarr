import {FlashList} from '@shopify/flash-list';
import React, {ReactElement, useCallback} from 'react';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';
import {TimeDivider} from '../Dividers/TimeDivider.tsx';
import {SpaceDivider} from '../Dividers/SpaceDivider.tsx';
import {getDayMarker, getTimeMarker} from '../../../libraries/DateTime.ts';
import {EventData, FezData} from '../../../libraries/Structs/ControllerStructs.tsx';
import {NativeScrollEvent, NativeSyntheticEvent, RefreshControlProps} from 'react-native';
import {getScheduleListTimeSeparatorID} from '../../../libraries/Schedule.ts';
import {styleDefaults} from '../../../styles';
import {LoadingNextFooter} from '../Footers/LoadingNextFooter.tsx';

interface ScheduleFlatListBaseProps<TItem> {
  items: TItem[];
  separator?: 'day' | 'time' | 'none';
  listHeader?: ReactElement;
  listFooter?: ReactElement;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  initialScrollIndex?: number;
  estimatedItemSize?: number;
  listRef?: React.RefObject<FlashList<TItem>> | null;
  renderItem: ({item}: {item: TItem}) => ReactElement;
  keyExtractor: (item: TItem) => string;
  onScrollThreshold?: (condition: boolean) => void;
  handleLoadNext?: () => void;
  handleLoadPrevious?: () => void;
  hasNextPage?: boolean;
}

export const ScheduleFlatListBase = <TItem extends FezData | EventData>({
  items,
  separator,
  refreshControl,
  listHeader,
  listFooter,
  initialScrollIndex,
  estimatedItemSize,
  listRef = null,
  renderItem,
  keyExtractor,
  onScrollThreshold,
  handleLoadNext,
  hasNextPage,
}: ScheduleFlatListBaseProps<TItem>) => {
  const {commonStyles} = useStyles();

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
    if (items.length <= 1) {
      return <></>;
    }
    if (hasNextPage) {
      return <LoadingNextFooter />;
    }
    return <TimeDivider />;
  }, [hasNextPage, items.length]);

  const renderSeparatorTime = ({leadingItem}: {leadingItem: TItem}) => {
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
  };

  // FlashList skips separator when paginating.
  // https://github.com/Shopify/flash-list/issues/633
  const renderSeparatorDay = ({leadingItem}: {leadingItem: TItem}) => {
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
  };

  const renderSeparatorNone = () => <SpaceDivider />;

  let ItemSeparatorComponent = renderSeparatorTime;
  switch (separator) {
    case 'day':
      ItemSeparatorComponent = renderSeparatorDay;
      break;
    case 'none':
      ItemSeparatorComponent = renderSeparatorNone;
  }

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (onScrollThreshold) {
      onScrollThreshold(event.nativeEvent.contentOffset.y > styleDefaults.listScrollThreshold);
    }
  };

  return (
    <FlashList
      refreshControl={refreshControl}
      ItemSeparatorComponent={ItemSeparatorComponent}
      data={items}
      renderItem={renderItem}
      ListHeaderComponent={listHeader || renderListHeader}
      ListFooterComponent={listFooter || renderListFooter}
      ref={listRef}
      keyExtractor={keyExtractor}
      initialScrollIndex={initialScrollIndex}
      estimatedItemSize={estimatedItemSize}
      contentContainerStyle={{
        ...commonStyles.paddingHorizontal,
      }}
      onScroll={handleScroll}
      onEndReached={handleLoadNext}
    />
  );
};
