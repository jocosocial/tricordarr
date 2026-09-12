import React, {useCallback} from 'react';
import {RefreshControlProps} from 'react-native';

import {AppFlashList} from '#src/Components/Lists/AppFlashList';
import {UserFlatListItem} from '#src/Components/Lists/Items/UserFlatListItem';
import {useSelection} from '#src/Context/Contexts/SelectionContext';
import {useAppFlashList} from '#src/Hooks/useAppFlashList';
import {type UserRelationMode} from '#src/Queries/Users/UserRelationConstants';
import {UserHeader} from '#src/Structs/ControllerStructs';

interface UserFlatListProps {
  userHeaders: UserHeader[];
  refreshControl?: React.ReactElement<RefreshControlProps>;
  renderListHeader: () => React.ReactNode;
  onUserPress: (userHeader: UserHeader) => void;
  swipeableMode?: UserRelationMode;
}

/**
 * A virtualized list of users (e.g. favorites, blocks, mutes). Uses AppFlashList
 * with Divider separators and optional header/footer.
 */
export const UserFlatList = ({
  userHeaders,
  refreshControl,
  renderListHeader,
  onUserPress,
  swipeableMode,
}: UserFlatListProps) => {
  const {enableSelection, setEnableSelection, selectedItems} = useSelection();
  const {getListSeparator, getListHeader: getDividerHeader, getListFooter} = useAppFlashList({data: userHeaders});

  const renderItem = useCallback(
    ({item}: {item: UserHeader}) => (
      <UserFlatListItem
        userHeader={item}
        onPress={onUserPress}
        swipeableMode={swipeableMode}
        enableSelection={enableSelection}
        setEnableSelection={setEnableSelection}
        selected={selectedItems.some(s => s.id === item.userID)}
      />
    ),
    [onUserPress, swipeableMode, enableSelection, setEnableSelection, selectedItems],
  );

  const getListHeader = useCallback(() => {
    return (
      <>
        {renderListHeader()}
        {getDividerHeader()}
      </>
    );
  }, [renderListHeader, getDividerHeader]);

  return (
    <AppFlashList<UserHeader>
      refreshControl={refreshControl}
      renderItem={renderItem}
      data={userHeaders}
      keyExtractor={(item: UserHeader) => item.userID}
      renderItemSeparator={getListSeparator}
      renderListHeader={getListHeader}
      renderListFooter={getListFooter}
      maintainVisibleContentPosition={{disabled: true}}
    />
  );
};
