import {FlashList} from '@shopify/flash-list';
import React, {ReactElement, useCallback} from 'react';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';
import {TimeDivider} from '../Dividers/TimeDivider.tsx';
import {SpaceDivider} from '../Dividers/SpaceDivider.tsx';
import {getDayMarker, getTimeMarker} from '../../../libraries/DateTime.ts';
import {EventData, FezData, PersonalEventData} from '../../../libraries/Structs/ControllerStructs.tsx';
import {RefreshControlProps} from 'react-native';

interface ScheduleFlatListBaseProps {
  items: (EventData | FezData | PersonalEventData)[];
  separator?: 'day' | 'time' | 'none';
  listHeader?: ReactElement;
  listFooter?: ReactElement;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  initialScrollIndex?: number;
  estimatedItemSize?: number;
  listRef?: React.RefObject<FlashList<EventData | FezData | PersonalEventData>> | null;
  renderItem: ({item}: {item: EventData | FezData | PersonalEventData}) => ReactElement;
  keyExtractor: (item: EventData | FezData | PersonalEventData) => string;
}

export const ScheduleFlatListBase = ({
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
}: ScheduleFlatListBaseProps) => {
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

  const renderListFooter = () => <TimeDivider label={'End'} />;

  const renderSeparatorDay = ({leadingItem}: {leadingItem: FezData}) => {
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

  return (
    <FlashList
      refreshControl={refreshControl}
      ItemSeparatorComponent={renderSeparatorDay}
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
    />
  );
};
