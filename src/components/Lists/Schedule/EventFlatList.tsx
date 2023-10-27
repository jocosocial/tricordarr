import {EventData} from '../../../libraries/Structs/ControllerStructs';
import {FlatList, RefreshControlProps, View} from 'react-native';
import React from 'react';
import {ScheduleEventCard} from '../../Cards/Schedule/ScheduleEventCard';
import {LabelDivider} from '../Dividers/LabelDivider';
import moment from 'moment-timezone';
import {TimeDivider} from '../Dividers/TimeDivider';
import {SpaceDivider} from '../Dividers/SpaceDivider';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {Text} from 'react-native-paper';

interface SeamailFlatListProps {
  eventList: EventData[];
  refreshControl?: React.ReactElement<RefreshControlProps>;
}

export const EventFlatList = ({eventList, refreshControl}: SeamailFlatListProps) => {
  const {commonStyles} = useStyles();
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
      return <TimeDivider label={'Leading Unknown'} />;
    }
    const trailingIndex = leadingIndex + 1;
    const leadingDate = new Date(eventList[leadingIndex].startTime);
    const trailingDate = new Date(eventList[trailingIndex].startTime);
    const leadingTimeMarker = `${leadingDate.getHours()}:${leadingDate.getMinutes()}`;
    const trailingTimeMarker = `${trailingDate.getHours()}:${trailingDate.getMinutes()}`;
    if (leadingTimeMarker === trailingTimeMarker) {
      return <SpaceDivider />;
    }
    const trailingItem = eventList[trailingIndex];
    return <TimeDivider label={getTimeMarker(trailingItem.startTime, trailingItem.timeZone)} />;
  };

  const getHeader = () => {
    let firstTimeDivider = <TimeDivider label={'No events today'} />;
    if (eventList[0]) {
      firstTimeDivider = <TimeDivider label={getTimeMarker(eventList[0].startTime, eventList[0].timeZone)} />;
    }
    return (
      <View>
        <Text>
          Schedule for Today:
        </Text>
        {firstTimeDivider}
      </View>
    );
  };

  return (
    <FlatList
      style={{
        ...commonStyles.paddingHorizontal,
      }}
      refreshControl={refreshControl}
      ItemSeparatorComponent={renderSeparator}
      data={eventList}
      renderItem={renderItem}
      ListHeaderComponent={getHeader}
    />
  );
};
