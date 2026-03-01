import React, {useCallback} from 'react';
import {RefreshControlProps} from 'react-native';
import {Divider} from 'react-native-paper';

import {AppFlashList} from '#src/Components/Lists/AppFlashList';
import {EndResultsFooter} from '#src/Components/Lists/Footers/EndResultsFooter';
import {NoResultsFooter} from '#src/Components/Lists/Footers/NoResultsFooter';
import {UserListItem} from '#src/Components/Lists/Items/UserListItem';
import {UserListItemSwipeable} from '#src/Components/Swipeables/UserListItemSwipeable';
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
export const UserFlatList = (props: UserFlatListProps) => {
  const {userHeaders, refreshControl, renderListHeader, onUserPress, swipeableMode} = props;

  const getListSeparator = useCallback(() => {
    if (userHeaders.length > 0) {
      return <Divider bold={true} />;
    }
    return <></>;
  }, [userHeaders.length]);

  const renderItem = useCallback(
    ({item}: {item: UserHeader}) => {
      const listItem = <UserListItem userHeader={item} onPress={() => onUserPress(item)} />;
      if (swipeableMode) {
        return (
          <UserListItemSwipeable userHeader={item} mode={swipeableMode}>
            {listItem}
          </UserListItemSwipeable>
        );
      }
      return listItem;
    },
    [onUserPress, swipeableMode],
  );

  const getListFooter = useCallback(() => {
    if (userHeaders.length > 0) {
      return <EndResultsFooter />;
    }
    return <NoResultsFooter />;
  }, [userHeaders.length]);

  const getListHeader = useCallback(() => {
    return (
      <>
        {renderListHeader()}
        {userHeaders.length > 0 && <Divider bold={true} />}
      </>
    );
  }, [renderListHeader, userHeaders.length]);

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
