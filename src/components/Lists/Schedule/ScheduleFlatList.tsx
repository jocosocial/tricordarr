import {EventData, FezData} from '#src/Libraries/Structs/ControllerStructs.tsx';
import React, {Dispatch, ReactElement, SetStateAction, useCallback} from 'react';
import {RefreshControlProps} from 'react-native';
import {CommonStackComponents, useCommonStack} from '#src/Components/Navigation/CommonScreens.tsx';
import {getScheduleItemMarker} from '#src/Libraries/Schedule.ts';
import {useConfig} from '#src/Components/Context/Contexts/ConfigContext.ts';
import {EventCardListItem} from '#src/Components/Lists/Items/Event/EventCardListItem.tsx';
import {PersonalEventCardListItem} from '#src/Components/Lists/Items/PersonalEvent/PersonalEventCardListItem.tsx';
import {useCruise} from '#src/Components/Context/Contexts/CruiseContext.ts';
import useDateTime from '#src/Libraries/DateTime.ts';
import {ScheduleFlatListBase} from './ScheduleFlatListBase.tsx';
import {ScheduleFlatListSeparator} from '#src/Libraries/Types/index.ts';
import {FlashList} from '@shopify/flash-list';
import {FezType} from '#src/Libraries/Enums/FezType.ts';
import {FezCard} from '#src/Components/Cards/Schedule/FezCard.tsx';

interface ScheduleFlatListProps<TItem> {
  items: TItem[];
  refreshControl?: React.ReactElement<RefreshControlProps>;
  listRef: React.RefObject<FlashList<TItem>>;
  separator?: ScheduleFlatListSeparator;
  listHeader?: ReactElement;
  listFooter?: ReactElement;
  initialScrollIndex?: number;
  setRefreshing?: Dispatch<SetStateAction<boolean>>;
  onScrollThreshold?: (condition: boolean) => void;
}

export const ScheduleFlatList = <TItem extends EventData | FezData>({
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
      // const tzOffset = getTimeZoneOffset(portTimeZoneID, item.timeZoneID, item.startTime);
      // @TODO this is a manual hack, need to undo this and understand what went wr
      // const tzOffset = 0;
      // console.log(tzOffset);
      const marker = getScheduleItemMarker(item, appConfig.manualTimeOffset, minutelyUpdatingDate, startDate, endDate);
      if ('fezID' in item) {
        if (FezType.isLFGType(item.fezType)) {
          return (
            <FezCard
              fez={item}
              onPress={() =>
                commonNavigation.push(CommonStackComponents.lfgScreen, {
                  fezID: item.fezID,
                })
              }
              marker={marker}
              showIcon={true}
            />
          );
        } else {
          return (
            <PersonalEventCardListItem
              eventData={item}
              onPress={() => commonNavigation.push(CommonStackComponents.personalEventScreen, {eventID: item.fezID})}
              marker={marker}
            />
          );
        }
      } else if ('eventID' in item) {
        return (
          <EventCardListItem
            eventData={item}
            onPress={() => commonNavigation.push(CommonStackComponents.eventScreen, {eventID: item.eventID})}
            marker={marker}
            setRefreshing={setRefreshing}
          />
        );
      }
      return <></>;
    },
    [appConfig.portTimeZoneID, minutelyUpdatingDate, startDate, endDate, setRefreshing, commonNavigation],
  );

  const keyExtractor = (item: TItem) => {
    if ('fezID' in item) {
      return item.fezID;
    } else {
      return item.eventID;
    }
  };

  return (
    <ScheduleFlatListBase
      listRef={listRef}
      keyExtractor={keyExtractor}
      items={items}
      renderItem={renderItem}
      separator={separator}
      refreshControl={refreshControl}
      onScrollThreshold={onScrollThreshold}
      estimatedItemSize={120}
      extraData={[minutelyUpdatingDate, appConfig.manualTimeOffset]}
    />
  );
};
