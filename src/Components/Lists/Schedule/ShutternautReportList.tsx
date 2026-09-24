import {type FlashListRef} from '@shopify/flash-list';
import React, {useCallback} from 'react';
import {RefreshControlProps} from 'react-native';

import {AppFlashList} from '#src/Components/Lists/AppFlashList';
import {ShutternautReportListItem} from '#src/Components/Lists/Items/Event/ShutternautReportListItem';
import {useAppFlashList} from '#src/Hooks/useAppFlashList';
import {ShutternautScheduleReportData} from '#src/Structs/ControllerStructs';

interface ShutternautReportListProps {
  items: ShutternautScheduleReportData[];
  listRef: React.RefObject<FlashListRef<ShutternautScheduleReportData> | null>;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  handleLoadNext: () => void;
  hasNextPage?: boolean;
}

/**
 * Virtualized list of photography-coverage rows. Uses AppFlashList with the shared Divider chrome.
 */
export const ShutternautReportList = ({
  items,
  listRef,
  refreshControl,
  handleLoadNext,
  hasNextPage,
}: ShutternautReportListProps) => {
  const {getListSeparator, getListHeader, getListFooter} = useAppFlashList({data: items, hasNextPage});

  const renderItem = useCallback(
    ({item}: {item: ShutternautScheduleReportData}) => <ShutternautReportListItem reportData={item} />,
    [],
  );

  const keyExtractor = useCallback((item: ShutternautScheduleReportData) => item.eventID, []);

  return (
    <AppFlashList<ShutternautScheduleReportData>
      ref={listRef}
      refreshControl={refreshControl}
      renderItem={renderItem}
      data={items}
      keyExtractor={keyExtractor}
      handleLoadNext={handleLoadNext}
      renderItemSeparator={getListSeparator}
      renderListHeader={getListHeader}
      renderListFooter={getListFooter}
      maintainVisibleContentPosition={{disabled: true}}
    />
  );
};
