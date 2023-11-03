import {RefreshControlProps, View} from 'react-native';
import React from 'react';
import {ScheduleEventCard} from '../../Cards/Schedule/ScheduleEventCard';
import {TimeDivider} from '../Dividers/TimeDivider';
import {SpaceDivider} from '../Dividers/SpaceDivider';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {FlatList} from 'react-native-gesture-handler';
import {ScheduleItem} from '../../../libraries/Types';
import {calcCruiseDayTime, getTimeMarker, getTimeZoneOffset} from '../../../libraries/DateTime';
import {parseISO} from 'date-fns';
import {useCruise} from '../../Context/Contexts/CruiseContext';
import {useScheduleStackRoute} from '../../Navigation/Stacks/ScheduleStackNavigator';

interface SeamailFlatListProps {
  scheduleItems: ScheduleItem[];
  refreshControl?: React.ReactElement<RefreshControlProps>;
  listRef: React.RefObject<FlatList<ScheduleItem>>;
}

export const EventFlatList = ({scheduleItems, refreshControl, listRef}: SeamailFlatListProps) => {
  const {commonStyles} = useStyles();
  const {startDate, endDate, cruiseDayToday} = useCruise();
  const route = useScheduleStackRoute();

  const renderItem = ({item}: {item: ScheduleItem}) => {
    return (
      <View>
        <ScheduleEventCard item={item} />
      </View>
    );
  };

  const renderSeparator = ({leadingItem}: {leadingItem: ScheduleItem}) => {
    const leadingIndex = scheduleItems.indexOf(leadingItem);
    if (leadingIndex === undefined) {
      return <TimeDivider label={'Leading Unknown?'} />;
    }
    const trailingIndex = leadingIndex + 1;
    const leadingDate = new Date(scheduleItems[leadingIndex].startTime);
    const trailingDate = new Date(scheduleItems[trailingIndex].startTime);
    const leadingTimeMarker = `${leadingDate.getHours()}:${leadingDate.getMinutes()}`;
    const trailingTimeMarker = `${trailingDate.getHours()}:${trailingDate.getMinutes()}`;
    if (leadingTimeMarker === trailingTimeMarker) {
      return <SpaceDivider />;
    }
    const trailingItem = scheduleItems[trailingIndex];
    return <TimeDivider label={getTimeMarker(trailingItem.startTime, trailingItem.timeZone)} />;
  };

  const getHeader = () => {
    if (!scheduleItems[0]) {
      return <TimeDivider label={'No events today'} />;
    }
    return <TimeDivider label={getTimeMarker(scheduleItems[0].startTime, scheduleItems[0].timeZone)} />;
  };

  const getInitialScrollindex = () => {
    if (route.params.cruiseDay !== cruiseDayToday) {
      return 0;
    }
    for (let i = 0; i < scheduleItems.length; i++) {
      const eventStartDayTime = calcCruiseDayTime(parseISO(scheduleItems[i].startTime), startDate, endDate);
      const nowDayTime = calcCruiseDayTime(new Date(), startDate, endDate);
      const tzOffset = getTimeZoneOffset('America/New_York', scheduleItems[i].timeZone, scheduleItems[i].startTime);
      // console.log(itemList[i].title, eventStartDayTime, nowDayTime, tzOffset);
      if (
        eventStartDayTime.dayMinutes + tzOffset >= nowDayTime.dayMinutes &&
        eventStartDayTime.cruiseDay === nowDayTime.cruiseDay
      ) {
        // @TODO Consider i - 1 again?
        return i;
      }
    }
    return 0;
  };

  /**
   * Optimizing function necessary for the initialScrollIndex to function. The heights were
   * statically calculated. I don't see a good way to do this.
   * @param data The same data array passed to the FlatList.
   * @param index Number of the array index of the data.
   */
  const getItemLayout = (data: ScheduleItem[] | null | undefined, index: number) => {
    const itemHeight = 106;
    const separatorHeight = 44;
    let separator = separatorHeight;
    if (
      data &&
      index >= 1 &&
      parseISO(data[index - 1].startTime).getHours() === parseISO(data[index].startTime).getHours()
    ) {
      separator = separatorHeight / 2;
    }
    return {
      length: itemHeight + separator,
      offset: (itemHeight + separator) * index,
      index,
    };
  };

  const initialIndex = getInitialScrollindex();
  console.log('Initial scroll index is ', initialIndex, scheduleItems[initialIndex]?.title);

  return (
    <FlatList
      style={{
        ...commonStyles.paddingHorizontal,
      }}
      refreshControl={refreshControl}
      ItemSeparatorComponent={renderSeparator}
      data={scheduleItems}
      renderItem={renderItem}
      ListHeaderComponent={getHeader}
      ListFooterComponent={() => <TimeDivider label={'End of Schedule'} />}
      // initialScrollIndex={getInitialScrollindex()}
      // initialScrollIndex={5}
      // getItemLayout={getItemLayout}
      ref={listRef}
    />
  );
};
