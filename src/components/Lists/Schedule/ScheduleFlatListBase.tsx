import {FlashList} from '@shopify/flash-list';
import React, {ReactElement, useCallback} from 'react';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {TimeDivider} from '#src/Components/Lists/Dividers/TimeDivider';
import {SpaceDivider} from '#src/Components/Lists/Dividers/SpaceDivider';
import {getDayMarker, getTimeMarker} from '#src/Libraries/DateTime';
import {EventData, FezData} from '#src/Structs/ControllerStructs';
import {NativeScrollEvent, NativeSyntheticEvent, RefreshControlProps} from 'react-native';
import {getScheduleListTimeSeparatorID} from '#src/Libraries/Schedule';
import {styleDefaults} from '#src/Styles';
import {LoadingNextFooter} from '#src/Components/Lists/Footers/LoadingNextFooter';

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
  extraData?: any;
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
  extraData,
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

    let label: string | undefined = getTimeMarker(firstItem.startTime, firstItem.timeZoneID);
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
    // The timeZoneIDs are required to accurately calculate the marker.
    if (!leadingItem.timeZoneID || !trailingItem.timeZoneID) {
      return <SpaceDivider />;
    }
    const leadingTimeMarker = getDayMarker(leadingItem.startTime, leadingItem.timeZoneID);
    const trailingTimeMarker = getDayMarker(trailingItem.startTime, trailingItem.timeZoneID);
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
      extraData={extraData}
    />
  );
};
