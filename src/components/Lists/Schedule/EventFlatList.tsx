import {EventData} from '../../../libraries/Structs/ControllerStructs';
import {FlatList, RefreshControlProps, View} from 'react-native';
import React from 'react';
import {ScheduleEventCard} from '../../Cards/Schedule/ScheduleEventCard';
import {LabelDivider} from '../Dividers/LabelDivider';
import moment from 'moment-timezone';

interface SeamailFlatListProps {
  eventList: EventData[];
  refreshControl?: React.ReactElement<RefreshControlProps>;
}

export const EventFlatList = ({eventList, refreshControl}: SeamailFlatListProps) => {
  console.log(`There are ${eventList.length} events today.`);
  const renderItem = ({item}: {item: EventData}) => {
    return (
      <View>
        <ScheduleEventCard event={item} />
      </View>
    );
  };

  const getTimeMarker = (dateTimeStr: string, timeZoneAbbrStr: string) => {
    const date = moment(dateTimeStr);
    const timeMarker = date.tz(timeZoneAbbrStr).format('hh:mm A');
    return `${timeMarker} ${timeZoneAbbrStr}`;
  };

  const renderSeparator = ({leadingItem}: {leadingItem: EventData}) => {
    const leadingIndex = eventList.indexOf(leadingItem);
    if (leadingIndex === undefined) {
      return <LabelDivider label={'Leading Unknown'} />;
    }
    const trailingIndex = leadingIndex + 1;
    const leadingDate = new Date(eventList[leadingIndex].startTime);
    const trailingDate = new Date(eventList[trailingIndex].startTime);
    const leadingTimeMarker = `${leadingDate.getHours()}:${leadingDate.getMinutes()}`;
    const trailingTimeMarker = `${trailingDate.getHours()}:${trailingDate.getMinutes()}`;
    if (leadingTimeMarker === trailingTimeMarker) {
      return <></>;
    }
    const trailingItem = eventList[trailingIndex];
    return <LabelDivider label={getTimeMarker(trailingItem.startTime, trailingItem.timeZone)} />;
  };

  const getHeader = () => {
    if (!eventList[0]) {
      return <LabelDivider label={'No events today'} />;
    }
    return <LabelDivider label={getTimeMarker(eventList[0].startTime, eventList[0].timeZone)} />;
  };

  return (
    <FlatList
      refreshControl={refreshControl}
      ItemSeparatorComponent={renderSeparator}
      data={eventList}
      renderItem={renderItem}
      ListHeaderComponent={getHeader}
    />
  );
};
