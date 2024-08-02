import {FlatList, RefreshControlProps} from 'react-native';
import React, {Dispatch, ReactElement, SetStateAction, useCallback} from 'react';
import {TimeDivider} from '../Dividers/TimeDivider';
import {SpaceDivider} from '../Dividers/SpaceDivider';
import {useStyles} from '../../Context/Contexts/StyleContext';
import useDateTime, {
  calcCruiseDayTime,
  getDayMarker,
  getTimeMarker,
  getTimeZoneOffset,
} from '../../../libraries/DateTime';
import {EventData, FezData, PersonalEventData} from '../../../libraries/Structs/ControllerStructs';
import {LfgCard} from '../../Cards/Schedule/LfgCard';
import {parseISO} from 'date-fns';
import {useCruise} from '../../Context/Contexts/CruiseContext';
import {useConfig} from '../../Context/Contexts/ConfigContext';
import {ScheduleCardMarkerType} from '../../../libraries/Types';
import {EventCardListItem} from '../Items/Event/EventCardListItem';
import {CommonStackComponents, useCommonStack} from '../../Navigation/CommonScreens';
import {PersonalEventCardListItem} from '../Items/PersonalEvent/PersonalEventCardListItem.tsx';

interface EventFlatListProps {
  scheduleItems: (EventData | FezData | PersonalEventData)[];
  refreshControl?: React.ReactElement<RefreshControlProps>;
  listRef: React.RefObject<FlatList<EventData | FezData | PersonalEventData>>;
  setRefreshing?: Dispatch<SetStateAction<boolean>>;
  separator?: 'day' | 'time' | 'none';
  listHeader?: ReactElement;
  listFooter?: ReactElement;
}

const getItemMarker = (
  item: EventData | FezData | PersonalEventData,
  portTimeZoneID: string,
  nowDate: Date,
  startDate: Date,
  endDate: Date,
): ScheduleCardMarkerType => {
  if (!item.startTime || !item.endTime || !item.timeZoneID) {
    return;
  }
  const itemStartTime = parseISO(item.startTime);
  const itemEndTime = parseISO(item.endTime);
  const eventStartDayTime = calcCruiseDayTime(itemStartTime, startDate, endDate);
  const eventEndDayTime = calcCruiseDayTime(itemEndTime, startDate, endDate);
  const nowDayTime = calcCruiseDayTime(nowDate, startDate, endDate);
  const tzOffset = getTimeZoneOffset(portTimeZoneID, item.timeZoneID, item.startTime);
  if (
    nowDayTime.cruiseDay === eventStartDayTime.cruiseDay &&
    nowDayTime.dayMinutes - tzOffset >= eventStartDayTime.dayMinutes &&
    nowDayTime.dayMinutes - tzOffset < eventEndDayTime.dayMinutes
  ) {
    return 'now';
  } else if (
    nowDayTime.cruiseDay === eventStartDayTime.cruiseDay &&
    nowDayTime.dayMinutes - tzOffset >= eventStartDayTime.dayMinutes - 30 &&
    nowDayTime.dayMinutes - tzOffset < eventStartDayTime.dayMinutes
  ) {
    return 'soon';
  }
};

export const EventFlatList = ({
  scheduleItems,
  refreshControl,
  listRef,
  setRefreshing,
  listHeader,
  listFooter,
  separator = 'time',
}: EventFlatListProps) => {
  const {commonStyles} = useStyles();
  const commonNavigation = useCommonStack();
  const {startDate, endDate} = useCruise();
  const minutelyUpdatingDate = useDateTime('minute');
  // const minutelyUpdatingDate = useRefreshingDate();
  const {appConfig} = useConfig();

  // https://reactnative.dev/docs/optimizing-flatlist-configuration
  const renderListItem = useCallback(
    ({item}: {item: EventData | FezData | PersonalEventData}) => {
      const marker = getItemMarker(item, appConfig.portTimeZoneID, minutelyUpdatingDate, startDate, endDate);
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
    [appConfig.portTimeZoneID, endDate, minutelyUpdatingDate, commonNavigation, setRefreshing, startDate],
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
    const leadingTimeMarker = `${leadingDate.getHours()}:${leadingDate.getMinutes()}`;
    const trailingTimeMarker = `${trailingDate.getHours()}:${trailingDate.getMinutes()}`;
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

  const onScrollToIndexFailed = (info: {
    index: number;
    highestMeasuredFrameIndex: number;
    averageItemLength: number;
  }) => {
    const itemHeight = 106;
    const separatorHeight = 44;
    listRef.current?.scrollToOffset({
      offset: (itemHeight + separatorHeight) * info.index,
    });
  };

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
    <FlatList
      style={{
        ...commonStyles.paddingHorizontal,
      }}
      refreshControl={refreshControl}
      ItemSeparatorComponent={ItemSeparatorComponent}
      data={scheduleItems}
      renderItem={renderListItem}
      ListHeaderComponent={listHeader || renderListHeader}
      ListFooterComponent={listFooter || renderListFooter}
      // @TODO for some reason enabling initialScrollIndex and the function cause the list to be 1 element
      // and show no more. I don't particularly care anymore.
      // initialScrollIndex={getInitialScrollIndex()}
      // initialScrollIndex={10}
      // initialScrollIndex={5}
      // getItemLayout={getItemLayout}
      ref={listRef}
      onScrollToIndexFailed={onScrollToIndexFailed}
      keyExtractor={keyExtractor}
      // This is likely to murder performance. But again, I don't particularly care anymore.
      initialNumToRender={100}
    />
  );
};
