import {EventData, FezData} from '../../../libraries/Structs/ControllerStructs';
import {RefreshControlProps, View} from 'react-native';
import React from 'react';
import {ScheduleEventCard} from '../../Cards/Schedule/ScheduleEventCard';
import moment from 'moment-timezone';
import {TimeDivider} from '../Dividers/TimeDivider';
import {SpaceDivider} from '../Dividers/SpaceDivider';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {FlatList} from 'react-native-gesture-handler'
import {ScheduleItem} from '../../../libraries/Types';
import {EventType} from '../../../libraries/Enums/EventType';
import {getTimeMarker} from '../../../libraries/DateTime';

interface SeamailFlatListProps {
  eventList: EventData[];
  lfgList: FezData[];
  refreshControl?: React.ReactElement<RefreshControlProps>;
}

export const EventFlatList = ({eventList, lfgList, refreshControl}: SeamailFlatListProps) => {
  const {commonStyles} = useStyles();

  let itemList: ScheduleItem[] = [];
  eventList.map(event => {
    itemList.push({
      title: event.title,
      startTime: event.startTime,
      endTime: event.endTime,
      timeZone: event.timeZone,
      location: event.location,
      itemType: event.eventType === EventType.shadow ? 'shadow' : 'official',
    });
  });
  lfgList.map(lfg => {
    itemList.push({
      title: lfg.title,
      startTime: lfg.startTime,
      endTime: lfg.endTime,
      timeZone: lfg.timeZone,
      location: lfg.location,
      itemType: 'lfg',
    });
  });

  // ChatGPT for the win
  itemList.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  console.log(`There are ${itemList.length} events today.`);
  const renderItem = ({item}: {item: ScheduleItem}) => {
    return (
      <View>
        <ScheduleEventCard item={item} />
      </View>
    );
  };

  const renderSeparator = ({leadingItem}: {leadingItem: ScheduleItem}) => {
    const leadingIndex = itemList.indexOf(leadingItem);
    if (leadingIndex === undefined) {
      return <TimeDivider label={'Leading Unknown?'} />;
    }
    const trailingIndex = leadingIndex + 1;
    const leadingDate = new Date(itemList[leadingIndex].startTime);
    const trailingDate = new Date(itemList[trailingIndex].startTime);
    const leadingTimeMarker = `${leadingDate.getHours()}:${leadingDate.getMinutes()}`;
    const trailingTimeMarker = `${trailingDate.getHours()}:${trailingDate.getMinutes()}`;
    if (leadingTimeMarker === trailingTimeMarker) {
      return <SpaceDivider />;
    }
    const trailingItem = itemList[trailingIndex];
    return <TimeDivider label={getTimeMarker(trailingItem.startTime, trailingItem.timeZone)} />;
  };

  const getHeader = () => {
    if (!itemList[0]) {
      return <TimeDivider label={'No events today'} />;
    }
    return <TimeDivider label={getTimeMarker(itemList[0].startTime, itemList[0].timeZone)} />;
  };

  return (
    <FlatList
      style={{
        ...commonStyles.paddingHorizontal,
      }}
      refreshControl={refreshControl}
      ItemSeparatorComponent={renderSeparator}
      data={itemList}
      renderItem={renderItem}
      ListHeaderComponent={getHeader}
      ListFooterComponent={() => <TimeDivider label={'End of Schedule'} />}
    />
  );
};
