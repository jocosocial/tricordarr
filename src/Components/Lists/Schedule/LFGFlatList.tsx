import {type FlashListRef} from '@shopify/flash-list';
import React, {ReactElement, useCallback} from 'react';
import {RefreshControlProps} from 'react-native';

import {FezCard} from '#src/Components/Cards/Schedule/FezCard';
import {ScheduleFlatListBase} from '#src/Components/Lists/Schedule/ScheduleFlatListBase';
import {FezType} from '#src/Enums/FezType';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {useLFGStackNavigation} from '#src/Navigation/Stacks/LFGStackNavigator';
import {FezData} from '#src/Structs/ControllerStructs';
import {ScheduleFlatListSeparator} from '#src/Types';

interface LFGFlatListProps {
  items: FezData[];
  refreshControl?: React.ReactElement<RefreshControlProps>;
  listRef: React.RefObject<FlashListRef<FezData> | null>;
  separator?: ScheduleFlatListSeparator;
  /** When false, day separators omit the day of week. Use when viewing a single cruise day. */
  showDayInDividers?: boolean;
  listHeader?: ReactElement;
  listFooter?: ReactElement;
  initialScrollIndex?: number;
  onScrollThreshold?: (condition: boolean) => void;
  hasNextPage?: boolean;
  handleLoadPrevious?: () => void;
  handleLoadNext?: () => void;
  renderItem?: ({item}: {item: FezData}) => React.JSX.Element;
  enableReportOnly?: boolean;
  /** When false, card shows time only (e.g. "2:00 PM - 3:00 PM"), no "Wed Mar 5" day part. Default true. */
  showDayInCard?: boolean;
  overScroll?: boolean;
}

export const LFGFlatList = ({
  items,
  refreshControl,
  separator = 'day',
  showDayInDividers = true,
  listRef,
  onScrollThreshold,
  handleLoadNext,
  handleLoadPrevious,
  hasNextPage,
  renderItem,
  enableReportOnly,
  showDayInCard = true,
  listHeader,
  overScroll,
}: LFGFlatListProps) => {
  const navigation = useLFGStackNavigation();

  const renderItemDefault = useCallback(
    ({item}: {item: FezData}) => {
      return (
        <FezCard
          fez={item}
          showDay={showDayInCard}
          onPress={() => {
            if (FezType.isLFGType(item.fezType)) {
              navigation.push(CommonStackComponents.lfgScreen, {fezID: item.fezID});
            } else if (FezType.isPrivateEventType(item.fezType)) {
              navigation.push(CommonStackComponents.personalEventScreen, {eventID: item.fezID});
            }
          }}
          enableReportOnly={enableReportOnly}
        />
      );
    },
    [navigation, enableReportOnly, showDayInCard],
  );

  const keyExtractor = useCallback((item: FezData) => item.fezID, []);

  return (
    <ScheduleFlatListBase
      listRef={listRef}
      keyExtractor={keyExtractor}
      items={items}
      renderItem={renderItem || renderItemDefault}
      separator={separator}
      showDayInDividers={showDayInDividers}
      refreshControl={refreshControl}
      onScrollThreshold={onScrollThreshold}
      handleLoadNext={handleLoadNext}
      handleLoadPrevious={handleLoadPrevious}
      hasNextPage={hasNextPage}
      listHeader={listHeader}
      overScroll={overScroll}
      // This is used to prevent the list from getting out of whack when the first item
      // gets muted and sent to or near the bottom.
      // Apparently FlashList uses the first item for some internal anchoring.
      maintainVisibleContentPosition={{disabled: true}}
    />
  );
};
