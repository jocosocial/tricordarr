import {EventData, FezData, PersonalEventData} from '../../../libraries/Structs/ControllerStructs.tsx';
import React, {Dispatch, ReactElement, SetStateAction, useCallback} from 'react';
import {FlatList, RefreshControlProps} from 'react-native';
import {LfgCard} from '../../Cards/Schedule/LfgCard.tsx';
import {CommonStackComponents, useCommonStack} from '../../Navigation/CommonScreens.tsx';
import {getScheduleItemMarker} from '../../../libraries/Schedule.ts';
import {useConfig} from '../../Context/Contexts/ConfigContext.ts';
import {EventCardListItem} from '../Items/Event/EventCardListItem.tsx';
import {PersonalEventCardListItem} from '../Items/PersonalEvent/PersonalEventCardListItem.tsx';
import {useCruise} from '../../Context/Contexts/CruiseContext.ts';
import useDateTime from '../../../libraries/DateTime.ts';
import {ScheduleFlatListBase} from './ScheduleFlatListBase.tsx';
import {ScheduleFlatListSeparator} from '../../../libraries/Types';

interface ScheduleFlatListProps<TItem> {
  items: TItem[];
  refreshControl?: React.ReactElement<RefreshControlProps>;
  listRef: React.RefObject<FlatList<TItem>>;
  separator?: ScheduleFlatListSeparator;
  listHeader?: ReactElement;
  listFooter?: ReactElement;
  initialScrollIndex?: number;
  setRefreshing?: Dispatch<SetStateAction<boolean>>;
  onScrollThreshold?: (condition: boolean) => void;
}

export const ScheduleFlatList = <TItem extends EventData | FezData | PersonalEventData>({
  items,
  refreshControl,
  separator = 'time',
  listRef,
  setRefreshing,
  onScrollThreshold,
}: ScheduleFlatListProps<TItem>) => {
  const commonNavigation = useCommonStack();
  const {appConfig} = useConfig();
  const {startDate, endDate} = useCruise();
  const minutelyUpdatingDate = useDateTime('minute');

  // https://reactnative.dev/docs/optimizing-flatlist-configuration
  const renderItem = useCallback(
    ({item}: {item: TItem}) => {
      const marker = getScheduleItemMarker(item, appConfig.portTimeZoneID, minutelyUpdatingDate, startDate, endDate);
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
    [appConfig.portTimeZoneID, minutelyUpdatingDate, startDate, endDate, setRefreshing, commonNavigation],
  );

  const keyExtractor = (item: TItem) => {
    if ('fezID' in item) {
      return item.fezID;
    } else if ('personalEventID' in item) {
      return item.personalEventID;
    } else {
      return item.eventID;
    }
  };

  return (
    <ScheduleFlatListBase
      flatListRef={listRef}
      keyExtractor={keyExtractor}
      items={items}
      renderItem={renderItem}
      separator={separator}
      refreshControl={refreshControl}
      onScrollThreshold={onScrollThreshold}
    />
  );
};
