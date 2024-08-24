import {RefreshControlProps} from 'react-native';
import React, {Dispatch, ReactElement, SetStateAction, useCallback} from 'react';
import {TimeDivider} from '../Dividers/TimeDivider';
import {SpaceDivider} from '../Dividers/SpaceDivider';
import {useStyles} from '../../Context/Contexts/StyleContext';
import useDateTime, {getDayMarker, getTimeMarker} from '../../../libraries/DateTime';
import {EventData, FezData, PersonalEventData} from '../../../libraries/Structs/ControllerStructs';
import {LfgCard} from '../../Cards/Schedule/LfgCard';
import {useCruise} from '../../Context/Contexts/CruiseContext';
import {useConfig} from '../../Context/Contexts/ConfigContext';
import {EventCardListItem} from '../Items/Event/EventCardListItem';
import {CommonStackComponents, useCommonStack} from '../../Navigation/CommonScreens';
import {PersonalEventCardListItem} from '../Items/PersonalEvent/PersonalEventCardListItem.tsx';
import {getScheduleItemMarker, getScheduleListTimeSeparatorID} from '../../../libraries/Schedule.ts';
import {FlashList} from '@shopify/flash-list';

interface EventFlatListProps {
  scheduleItems: (EventData | FezData | PersonalEventData)[];
  refreshControl?: React.ReactElement<RefreshControlProps>;
  listRef: React.RefObject<FlashList<EventData | FezData | PersonalEventData>>;
  setRefreshing?: Dispatch<SetStateAction<boolean>>;
  separator?: 'day' | 'time' | 'none';
  listHeader?: ReactElement;
  listFooter?: ReactElement;
  initialScrollIndex?: number;
}

export const EventFlatList = ({
  scheduleItems,
  refreshControl,
  listRef,
  setRefreshing,
  listHeader,
  listFooter,
  initialScrollIndex,
  separator = 'time',
}: EventFlatListProps) => {
  const commonNavigation = useCommonStack();
  const {startDate, endDate} = useCruise();
  const minutelyUpdatingDate = useDateTime('minute');
  // const minutelyUpdatingDate = useRefreshingDate();
  const {appConfig} = useConfig();
  const {commonStyles} = useStyles();

  // https://reactnative.dev/docs/optimizing-flatlist-configuration
  const renderListItem = useCallback(
    ({item}: {item: EventData | FezData | PersonalEventData}) => {
      const marker = getScheduleItemMarker(item, appConfig.portTimeZoneID, minutelyUpdatingDate, startDate, endDate);
      return (
        <>
          {'fezID' in item && (
            <LfgCard
              lfg={item}
              onPress={() =>
                commonNavigation.push(CommonStackComponents.lfgScreen, {
                  fezID: item.fezID,
                })
              }
              marker={marker}
              showLfgIcon={true}
            />
          )}
          {'eventID' in item && (
            <EventCardListItem
              eventData={item}
              onPress={() => commonNavigation.push(CommonStackComponents.eventScreen, {eventID: item.eventID})}
              marker={marker}
              setRefreshing={setRefreshing}
            />
          )}
          {'personalEventID' in item && (
            <PersonalEventCardListItem
              eventData={item}
              onPress={() =>
                commonNavigation.push(CommonStackComponents.personalEventScreen, {eventID: item.personalEventID})
              }
              marker={marker}
            />
          )}
        </>
      );
    },
    [appConfig.portTimeZoneID, minutelyUpdatingDate, startDate, endDate, setRefreshing, commonNavigation],
  );

  const renderSeparatorTime = ({leadingItem}: {leadingItem: EventData | FezData}) => {
    const leadingIndex = scheduleItems.indexOf(leadingItem);
    if (leadingIndex === undefined) {
      return <TimeDivider label={'Leading Unknown?'} />;
    }
    const trailingIndex = leadingIndex + 1;
    const trailingItem = scheduleItems[trailingIndex];
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

  const renderSeparatorDay = ({leadingItem}: {leadingItem: EventData | FezData}) => {
    const leadingIndex = scheduleItems.indexOf(leadingItem);
    if (leadingIndex === undefined) {
      return <TimeDivider label={'Leading Unknown?'} />;
    }
    const trailingIndex = leadingIndex + 1;
    const trailingItem = scheduleItems[trailingIndex];
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

  const renderListHeader = () => {
    if (!scheduleItems[0]) {
      return <TimeDivider label={'No events today'} />;
    }
    const firstItem = scheduleItems[0];
    if (!firstItem.startTime || !firstItem.timeZoneID) {
      return <SpaceDivider />;
    }

    let label = getTimeMarker(firstItem.startTime, firstItem.timeZoneID);
    if (separator === 'day') {
      label = getDayMarker(firstItem.startTime, firstItem.timeZoneID);
    }
    return <TimeDivider label={label} />;
  };

  const renderListFooter = () => <TimeDivider label={'End of Schedule'} />;

  const keyExtractor = (item: EventData | FezData | PersonalEventData) => {
    if ('fezID' in item) {
      return item.fezID;
    } else if ('personalEventID' in item) {
      return item.personalEventID;
    } else {
      return item.eventID;
    }
  };

  let ItemSeparatorComponent = renderSeparatorTime;
  switch (separator) {
    case 'day':
      ItemSeparatorComponent = renderSeparatorDay;
      break;
    case 'none':
      ItemSeparatorComponent = renderSeparatorNone;
  }

  return (
    <FlashList
      refreshControl={refreshControl}
      ItemSeparatorComponent={ItemSeparatorComponent}
      data={scheduleItems}
      renderItem={renderListItem}
      ListHeaderComponent={listHeader || renderListHeader}
      ListFooterComponent={listFooter || renderListFooter}
      ref={listRef}
      keyExtractor={keyExtractor}
      estimatedItemSize={120}
      initialScrollIndex={initialScrollIndex}
      contentContainerStyle={{
        ...commonStyles.paddingHorizontal,
      }}
    />
  );
};
