import React, {useCallback} from 'react';
import {RefreshControlProps} from 'react-native';

import {AppFlashList} from '#src/Components/Lists/AppFlashList';
import {ModerationReportGroupListItem} from '#src/Components/Lists/Items/Moderation/ModerationReportGroupListItem';
import {useAppFlashList} from '#src/Hooks/useAppFlashList';
import {ReportContentGroup} from '#src/Libraries/Moderation/ReportContentGroup';

interface ModerationReportsListProps {
  groups: ReportContentGroup[];
  showUnread?: boolean;
  refreshControl?: React.ReactElement<RefreshControlProps>;
}

/**
 * Virtualized list of grouped user reports. Uses AppFlashList with Divider separators.
 */
export const ModerationReportsList = ({groups, showUnread = false, refreshControl}: ModerationReportsListProps) => {
  const {getListSeparator, getListHeader, getListFooter} = useAppFlashList({data: groups});

  const renderItem = useCallback(
    ({item}: {item: ReportContentGroup}) => <ModerationReportGroupListItem group={item} showUnread={showUnread} />,
    [showUnread],
  );

  const keyExtractor = useCallback((item: ReportContentGroup) => `${item.reportType}-${item.reportedID}`, []);

  return (
    <AppFlashList<ReportContentGroup>
      refreshControl={refreshControl}
      renderItem={renderItem}
      data={groups}
      keyExtractor={keyExtractor}
      renderItemSeparator={getListSeparator}
      renderListHeader={getListHeader}
      renderListFooter={getListFooter}
      extraData={showUnread}
      maintainVisibleContentPosition={{disabled: true}}
    />
  );
};
