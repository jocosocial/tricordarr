import {EventData} from '../../../libraries/Structs/ControllerStructs';
import {FlatList, RefreshControlProps, View} from 'react-native';
import React from 'react';
import {ScheduleEventCard} from '../../Cards/Schedule/ScheduleEventCard';
import {LabelDivider} from '../Dividers/LabelDivider';
import {format} from 'date-fns';

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

  // @TODO this needs to adapt the date to the boat-time date.
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
    return <LabelDivider label={format(new Date(trailingItem.startTime), 'hh:mm aa')} />;
  };

  const getHeader = () => {
    const date = new Date(eventList[0].startTime);
    console.log('Time String: ', eventList[0].startTime);
    const timeString = date.toLocaleTimeString(undefined, {
      // timeZone: eventList[0].timeZone,
      timeZone: 'America/Puerto_Rico',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    return <LabelDivider label={'ZZZ ' + timeString} />;
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
