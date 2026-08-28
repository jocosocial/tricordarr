import React, {Dispatch, memo, SetStateAction, useCallback} from 'react';

import {UserListItem} from '#src/Components/Lists/Items/UserListItem';
import {UserListItemSwipeable} from '#src/Components/Swipeables/UserListItemSwipeable';
import {type UserRelationMode} from '#src/Queries/Users/UserRelationConstants';
import {UserHeader} from '#src/Structs/ControllerStructs';

interface UserFlatListItemProps {
  userHeader: UserHeader;
  onPress: (userHeader: UserHeader) => void;
  swipeableMode?: UserRelationMode;
  enableSelection: boolean;
  setEnableSelection: Dispatch<SetStateAction<boolean>>;
  selected: boolean;
}

/**
 * FlashList row for user relation lists. Owns the swipeable wrapper so
 * UserListItem can stay swipe-free for search, participants, and other screens.
 */
const UserFlatListItemInternal = ({
  userHeader,
  onPress,
  swipeableMode,
  enableSelection,
  setEnableSelection,
  selected,
}: UserFlatListItemProps) => {
  const handlePress = useCallback(() => onPress(userHeader), [onPress, userHeader]);

  const listItem = (
    <UserListItem
      userHeader={userHeader}
      onPress={handlePress}
      enableSelection={enableSelection}
      setEnableSelection={setEnableSelection}
      selected={selected}
    />
  );

  if (swipeableMode) {
    return (
      <UserListItemSwipeable userHeader={userHeader} mode={swipeableMode} enabled={!enableSelection}>
        {listItem}
      </UserListItemSwipeable>
    );
  }

  return listItem;
};

export const UserFlatListItem = memo(UserFlatListItemInternal);
