import {EventData, FezData} from '../../../libraries/Structs/ControllerStructs';
import {FlatList, RefreshControlProps, View} from 'react-native';
import {SeamailListItem} from '../Items/SeamailListItem';
import React from 'react';
import {Divider} from 'react-native-paper';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {SeamailSearchBar} from '../../Search/SeamailSearchBar';
import {SeamailAccountButtons} from '../../Buttons/SeamailAccountButtons';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext';
import {ScheduleEventCard} from '../../Cards/Schedule/ScheduleEventCard';
import {LabelDivider} from '../Dividers/LabelDivider';
import {format} from 'date-fns';

interface SeamailFlatListProps {
  eventList: EventData[];
  refreshControl?: React.ReactElement<RefreshControlProps>;
}

export const EventFlatList = ({eventList, refreshControl}: SeamailFlatListProps) => {
  console.log(`There are ${eventList.length} events`);
  const renderItem = ({item, index, separators}) => {
    return (
      // <View onLayout={() => separators.updateProps('trailing', {leadingIndex: index})}>
      <View>
        <ScheduleEventCard event={item} />
      </View>
    );
  };

  const renderSeparator = ({leadingItem}: {leadingItem: EventData}) => {
    const leadingIndex = eventList.indexOf(leadingItem);
    // return <LabelDivider label={leadingItem.title} />;
    console.log('The leading index is ', leadingIndex);
    if (leadingIndex === undefined) {
      return <LabelDivider label={'Leading Unknown'} />;
    }
    const trailingIndex = leadingIndex + 1;
    const leadingHour = new Date(eventList[leadingIndex].startTime).getHours();
    const trailingHour = new Date(eventList[trailingIndex].startTime).getHours();
    if (leadingHour === trailingHour) {
      return <></>;
    }
    const trailingItem = eventList[trailingIndex];
    return <LabelDivider label={format(new Date(trailingItem.startTime), 'hh:mm aa')} />;
  };

  return (
    <FlatList
      refreshControl={refreshControl}
      ItemSeparatorComponent={renderSeparator}
      data={eventList}
      renderItem={renderItem}
    />
  );
};
