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
import {EventData, FezData} from '../../../libraries/Structs/ControllerStructs';
import {LfgCard} from '../../Cards/Schedule/LfgCard';
import {useEventStackNavigation} from '../../Navigation/Stacks/EventStackNavigator';
import {BottomTabComponents, EventStackComponents, LfgStackComponents} from '../../../libraries/Enums/Navigation';
import {parseISO} from 'date-fns';
import {useCruise} from '../../Context/Contexts/CruiseContext';
import {useConfig} from '../../Context/Contexts/ConfigContext';
import {ScheduleCardMarkerType} from '../../../libraries/Types';
import {useBottomTabNavigator} from '../../Navigation/Tabs/BottomTabNavigator';
import {EventCardListItem} from '../Items/Event/EventCardListItem';

interface SeamailFlatListProps {
  scheduleItems: (EventData | FezData)[];
  refreshControl?: React.ReactElement<RefreshControlProps>;
  listRef: React.RefObject<FlatList<EventData | FezData>>;
  scrollNowIndex: number;
  setRefreshing?: Dispatch<SetStateAction<boolean>>;
  separator?: 'day' | 'time' | 'none';
  listHeader?: ReactElement;
  listFooter?: ReactElement;
}

const getItemMarker = (
  item: EventData | FezData,
  portTimeZoneID: string,
  nowDate: Date,
  startDate: Date,
  endDate: Date,
): ScheduleCardMarkerType => {
  if (!item.startTime || !item.endTime || !item.timeZone) {
    return;
  }
  const itemStartTime = parseISO(item.startTime);
  const itemEndTime = parseISO(item.endTime);
  const eventStartDayTime = calcCruiseDayTime(itemStartTime, startDate, endDate);
  const eventEndDayTime = calcCruiseDayTime(itemEndTime, startDate, endDate);
  const nowDayTime = calcCruiseDayTime(nowDate, startDate, endDate);
  const tzOffset = getTimeZoneOffset(portTimeZoneID, item.timeZone, item.startTime);
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
}: SeamailFlatListProps) => {
  const {commonStyles} = useStyles();
  const navigation = useEventStackNavigation();
  const {startDate, endDate} = useCruise();
  const minutelyUpdatingDate = useDateTime('minute');
  const {appConfig} = useConfig();
  const bottomNavigation = useBottomTabNavigator();

  // https://reactnative.dev/docs/optimizing-flatlist-configuration
  const renderListItem = useCallback(
    ({item}: {item: EventData | FezData}) => {
      const marker = getItemMarker(item, appConfig.portTimeZoneID, minutelyUpdatingDate, startDate, endDate);
      return (
        <>
          {'fezID' in item && (
            <LfgCard
              lfg={item}
              onPress={() =>
                bottomNavigation.navigate(BottomTabComponents.lfgTab, {
                  screen: LfgStackComponents.lfgScreen,
                  params: {fezID: item.fezID},
                  initial: false,
                })
              }
              marker={marker}
              showLfgIcon={true}
            />
          )}
          {'eventID' in item && (
            <EventCardListItem
              eventData={item}
              onPress={() => navigation.push(EventStackComponents.eventScreen, {eventID: item.eventID})}
              marker={marker}
              setRefreshing={setRefreshing}
            />
          )}
        </>
      );
    },
    [appConfig.portTimeZoneID, bottomNavigation, endDate, minutelyUpdatingDate, navigation, setRefreshing, startDate],
  );

  const renderSeparatorTime = ({leadingItem}: {leadingItem: EventData | FezData}) => {
    const leadingIndex = scheduleItems.indexOf(leadingItem);
    if (leadingIndex === undefined) {
      return <TimeDivider label={'Leading Unknown?'} />;
    }
    const trailingIndex = leadingIndex + 1;
    const trailingItem = scheduleItems[trailingIndex];
    if (!leadingItem.startTime || !trailingItem.startTime || !trailingItem.timeZone) {
      return <SpaceDivider />;
    }
    const leadingDate = new Date(leadingItem.startTime);
    const trailingDate = new Date(trailingItem.startTime);
    const leadingTimeMarker = `${leadingDate.getHours()}:${leadingDate.getMinutes()}`;
    const trailingTimeMarker = `${trailingDate.getHours()}:${trailingDate.getMinutes()}`;
    if (leadingTimeMarker === trailingTimeMarker) {
      return <SpaceDivider />;
    }
    return <TimeDivider label={getTimeMarker(trailingItem.startTime, trailingItem.timeZone)} />;
  };

  const renderSeparatorDay = ({leadingItem}: {leadingItem: EventData | FezData}) => {
    const leadingIndex = scheduleItems.indexOf(leadingItem);
    if (leadingIndex === undefined) {
      return <TimeDivider label={'Leading Unknown?'} />;
    }
    const trailingIndex = leadingIndex + 1;
    const trailingItem = scheduleItems[trailingIndex];
    if (!leadingItem.startTime || !trailingItem.startTime || !trailingItem.timeZone) {
      return <SpaceDivider />;
    }
    const leadingDate = new Date(leadingItem.startTime);
    const trailingDate = new Date(trailingItem.startTime);
    const leadingTimeMarker = leadingDate.getDay();
    const trailingTimeMarker = trailingDate.getDay();
    if (leadingTimeMarker === trailingTimeMarker) {
      return <SpaceDivider />;
    }
    return <TimeDivider label={getDayMarker(trailingItem.startTime, trailingItem.timeZone)} />;
  };

  const renderSeparatorNone = () => <SpaceDivider />;

  const renderListHeader = () => {
    if (!scheduleItems[0]) {
      return <TimeDivider label={'No events today'} />;
    }
    const firstItem = scheduleItems[0];
    if (!firstItem.startTime || !firstItem.timeZone) {
      return <SpaceDivider />;
    }

    let label = getTimeMarker(firstItem.startTime, firstItem.timeZone);
    if (separator === 'day') {
      label = getDayMarker(firstItem.startTime, firstItem.timeZone);
    }
    return <TimeDivider label={label} />;
  };

  const renderListFooter = () => <TimeDivider label={'End of Schedule'} />;

  const onScrollToIndexFailed = (info: {
    index: number;
    highestMeasuredFrameIndex: number;
    averageItemLength: number;
  }) => {
    console.info('Scroll Error Occurred', info);
    const itemHeight = 106;
    const separatorHeight = 44;
    listRef.current?.scrollToOffset({
      offset: (itemHeight + separatorHeight) * info.index,
    });
  };

  const keyExtractor = (item: EventData | FezData) => {
    if ('fezID' in item) {
      return item.fezID;
    } else {
      return item.eventID;
    }
  };

  // const initialIndex = getInitialScrollindex();
  // console.log('Initial scroll index is ', initialIndex, scheduleItems[initialIndex]?.title);
  console.log('EventFlatList is rendering');

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
