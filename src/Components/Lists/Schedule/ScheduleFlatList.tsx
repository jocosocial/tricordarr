import {type FlashListRef} from '@shopify/flash-list';
import React, {ReactElement, useCallback} from 'react';
import {RefreshControlProps, View} from 'react-native';

import {FezCard} from '#src/Components/Cards/Schedule/FezCard';
import {EventCardListItem} from '#src/Components/Lists/Items/Event/EventCardListItem';
import {PersonalEventCardListItem} from '#src/Components/Lists/Items/PersonalEvent/PersonalEventCardListItem';
import {ScheduleFlatListBase} from '#src/Components/Lists/Schedule/ScheduleFlatListBase';
import {ScheduleItemHighlightView} from '#src/Components/Views/Schedule/ScheduleItemHighlightView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useCruise} from '#src/Context/Contexts/CruiseContext';
import {FezType} from '#src/Enums/FezType';
import {useTimeZone} from '#src/Hooks/useTimeZone';
import useDateTime, {getTimeZoneOffset} from '#src/Libraries/DateTime';
import {getScheduleItemMarker} from '#src/Libraries/Schedule';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {EventData, FezData} from '#src/Structs/ControllerStructs';
import {ScheduleFlatListSeparator} from '#src/Types';

interface ScheduleFlatListProps<TItem> {
  items: TItem[];
  refreshControl?: React.ReactElement<RefreshControlProps>;
  listRef: React.RefObject<FlashListRef<TItem> | null>;
  separator?: ScheduleFlatListSeparator;
  /** When false, time separators omit the day of week. Use when viewing a single cruise day. */
  showDayInDividers?: boolean;
  listHeader?: ReactElement;
  listFooter?: ReactElement;
  /** Content above the first time divider that scrolls and refreshes with the list. */
  headerContent?: ReactElement;
  initialScrollIndex?: number;
  setRefreshing?: (value: boolean) => void;
  onScrollThreshold?: (condition: boolean) => void;
  handleLoadNext?: () => void;
  hasNextPage?: boolean;
  /** ID of an event or fez whose card gets a highlight border. */
  highlightedItemId?: string;
}

/**
 * Get the ID of a schedule item, whichever kind it is.
 */
const getItemId = (item: EventData | FezData) => ('fezID' in item ? item.fezID : item.eventID);

export const ScheduleFlatList = <TItem extends EventData | FezData>({
  items,
  refreshControl,
  separator = 'time',
  showDayInDividers = true,
  listRef,
  headerContent,
  setRefreshing,
  onScrollThreshold,
  handleLoadNext,
  hasNextPage,
  highlightedItemId,
}: ScheduleFlatListProps<TItem>): React.JSX.Element => {
  const commonNavigation = useCommonStack();
  const {appConfig} = useConfig();
  const {startDate, endDate} = useCruise();
  const {tzAtTime} = useTimeZone();
  const minutelyUpdatingDate = useDateTime('minute');

  /**
   * Render the card for a schedule item.
   */
  const renderCard = useCallback(
    (item: TItem) => {
      // Compute timezone offset from boat-at-now to item timezone for marker calculation
      const tzOffset =
        item.startTime && item.timeZoneID
          ? getTimeZoneOffset(tzAtTime(minutelyUpdatingDate), item.timeZoneID, item.startTime)
          : 0;
      const marker = getScheduleItemMarker(
        item,
        tzOffset,
        minutelyUpdatingDate,
        startDate,
        endDate,
        appConfig.enableDeveloperOptions || appConfig.schedule.showMarkersOutsideCruiseWeek,
      );
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
    [
      tzAtTime,
      minutelyUpdatingDate,
      startDate,
      endDate,
      appConfig.enableDeveloperOptions,
      appConfig.schedule.showMarkersOutsideCruiseWeek,
      commonNavigation,
      setRefreshing,
    ],
  );

  // https://reactnative.dev/docs/optimizing-flatlist-configuration
  const renderItem = useCallback(
    ({item}: {item: TItem}) => {
      if (getItemId(item) !== highlightedItemId) {
        return renderCard(item);
      }
      return (
        <View>
          {renderCard(item)}
          <ScheduleItemHighlightView />
        </View>
      );
    },
    [renderCard, highlightedItemId],
  );

  return (
    <ScheduleFlatListBase
      listRef={listRef}
      keyExtractor={getItemId}
      items={items}
      renderItem={renderItem}
      separator={separator}
      showDayInDividers={showDayInDividers}
      headerContent={headerContent}
      refreshControl={refreshControl}
      onScrollThreshold={onScrollThreshold}
      handleLoadNext={handleLoadNext}
      hasNextPage={hasNextPage}
      extraData={[minutelyUpdatingDate, appConfig.manualTimeOffset, appConfig.schedule.timeZoneLabelMode]}
    />
  );
};
