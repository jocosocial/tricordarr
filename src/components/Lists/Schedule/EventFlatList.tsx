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

interface SeamailFlatListProps {
  eventList: EventData[];
  refreshControl?: React.ReactElement<RefreshControlProps>;
}

export const EventFlatList = ({eventList, refreshControl}: SeamailFlatListProps) => {
  const renderItem = ({item, index, separators}) => {
    return <ScheduleEventCard event={item} />;
  };

  // const getSeparator = ({leadingItem, trailingItem}: {leadingItem: EventData; trailingItem: EventData}) => {
  //   console.log('Lead:', leadingItem);
  //   console.log('Trail', trailingItem);
  //   return <LabelDivider label={'foo'} />;
  // };

  return (
    <FlatList
      refreshControl={refreshControl}
      // ItemSeparatorComponent={getSeparator}
      data={eventList}
      renderItem={renderItem}
    />
  );
};
