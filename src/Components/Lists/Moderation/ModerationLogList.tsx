import React, {useCallback} from 'react';
import {RefreshControlProps} from 'react-native';

import {AppFlashList} from '#src/Components/Lists/AppFlashList';
import {ModerationLogListItem} from '#src/Components/Lists/Items/Moderation/ModerationLogListItem';
import {useAppFlashList} from '#src/Hooks/useAppFlashList';
import {ModeratorActionLogData} from '#src/Structs/ControllerStructs';

interface ModerationLogListProps {
  actions: ModeratorActionLogData[];
  refreshControl?: React.ReactElement<RefreshControlProps>;
  handleLoadNext: () => void;
  hasNextPage?: boolean;
}

/**
 * Virtualized list of logged moderator actions. Uses AppFlashList with Divider separators.
 */
export const ModerationLogList = ({actions, refreshControl, handleLoadNext, hasNextPage}: ModerationLogListProps) => {
  const {getListSeparator, getListHeader, getListFooter} = useAppFlashList({data: actions, hasNextPage});

  const renderItem = useCallback(
    ({item}: {item: ModeratorActionLogData}) => <ModerationLogListItem action={item} />,
    [],
  );

  const keyExtractor = useCallback((item: ModeratorActionLogData) => item.id, []);

  return (
    <AppFlashList<ModeratorActionLogData>
      refreshControl={refreshControl}
      renderItem={renderItem}
      data={actions}
      keyExtractor={keyExtractor}
      handleLoadNext={handleLoadNext}
      renderItemSeparator={getListSeparator}
      renderListHeader={getListHeader}
      renderListFooter={getListFooter}
      maintainVisibleContentPosition={{disabled: true}}
    />
  );
};
