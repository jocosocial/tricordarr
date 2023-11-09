import {FlatList, RefreshControlProps, View} from 'react-native';
import React from 'react';
import {TimeDivider} from '../Dividers/TimeDivider';
import {SpaceDivider} from '../Dividers/SpaceDivider';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {getTimeMarker} from '../../../libraries/DateTime';
import {EventData, FezData} from '../../../libraries/Structs/ControllerStructs';
import {LfgCard} from '../../Cards/Schedule/LfgCard';
import {EventCard} from '../../Cards/Schedule/EventCard';

interface SeamailFlatListProps {
  scheduleItems: (EventData | FezData)[];
  refreshControl?: React.ReactElement<RefreshControlProps>;
  listRef: React.RefObject<FlatList<EventData | FezData>>;
  scrollNowIndex: number;
}

export const EventFlatList = ({scheduleItems, refreshControl, listRef}: SeamailFlatListProps) => {
  const {commonStyles} = useStyles();

  const renderListItem = ({item}: {item: EventData | FezData}) => {
    return (
      <View>
        {'fezID' in item && <LfgCard lfg={item} />}
        {'eventID' in item && <EventCard eventData={item} />}
      </View>
    );
  };

  const renderListSeparator = ({leadingItem}: {leadingItem: EventData | FezData}) => {
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

  const renderListHeader = () => {
    if (!scheduleItems[0]) {
      return <TimeDivider label={'No events today'} />;
    }
    return <TimeDivider label={getTimeMarker(scheduleItems[0].startTime, scheduleItems[0].timeZone)} />;
  };

  const renderListFooter = () => <TimeDivider label={'End of Schedule'} />;

  // const getInitialScrollIndex = () => {
  //   let initialScrollIndex = 0;
  //   if (route.params.cruiseDay !== cruiseDayToday) {
  //     initialScrollIndex = 0;
  //   } else {
  //     for (let i = 0; i < scheduleItems.length; i++) {
  //       const eventStartDayTime = calcCruiseDayTime(parseISO(scheduleItems[i].startTime), startDate, endDate);
  //       const nowDayTime = calcCruiseDayTime(new Date(), startDate, endDate);
  //       const tzOffset = getTimeZoneOffset('America/New_York', scheduleItems[i].timeZone, scheduleItems[i].startTime);
  //       // console.log(itemList[i].title, eventStartDayTime, nowDayTime, tzOffset);
  //       if (
  //         eventStartDayTime.dayMinutes + tzOffset >= nowDayTime.dayMinutes &&
  //         eventStartDayTime.cruiseDay === nowDayTime.cruiseDay
  //       ) {
  //         // @TODO Consider i - 1 again?
  //         initialScrollIndex = i;
  //         break;
  //       }
  //     }
  //   }
  //   console.log('EventFlatList getInitialScrollIndex', initialScrollIndex);
  //   return initialScrollIndex;
  // };

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

  // /**
  //  * Optimizing function necessary for the initialScrollIndex to function. The heights were
  //  * statically calculated. I don't see a good way to do this.
  //  * @param data The same data array passed to the FlatList.
  //  * @param index Number of the array index of the data.
  //  */
  // const getItemLayout = (data: ScheduleItem[] | null | undefined, index: number) => {
  //   const itemHeight = 106;
  //   const separatorHeight = 44;
  //   let separator = separatorHeight;
  //   // if (
  //   //   data &&
  //   //   index >= 1 &&
  //   //   parseISO(data[index - 1].startTime).getHours() === parseISO(data[index].startTime).getHours()
  //   // ) {
  //   //   separator = separatorHeight / 2;
  //   // }
  //   return {
  //     length: itemHeight + separator,
  //     offset: (itemHeight + separator) * index,
  //     index,
  //   };
  // };

  const keyExtractor = (item: EventData | FezData) => {
    if ('eventID' in item) {
      return item.eventID;
    } else if ('fezID' in item) {
      return item.fezID;
    }
  };

  // const initialIndex = getInitialScrollindex();
  // console.log('Initial scroll index is ', initialIndex, scheduleItems[initialIndex]?.title);

  return (
    <FlatList
      style={{
        ...commonStyles.paddingHorizontal,
      }}
      // refreshControl={}
      refreshControl={refreshControl}
      ItemSeparatorComponent={renderListSeparator}
      data={scheduleItems}
      renderItem={renderListItem}
      ListHeaderComponent={renderListHeader}
      ListFooterComponent={renderListFooter}
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
