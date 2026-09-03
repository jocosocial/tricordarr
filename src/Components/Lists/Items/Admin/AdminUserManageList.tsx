import React from 'react';
import {Text} from 'react-native-paper';

import {UserListItem} from '#src/Components/Lists/Items/UserListItem';
import {UserMatchSearchBar} from '#src/Components/Search/UserSearchBar/UserMatchSearchBar';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {AppIcons} from '#src/Enums/Icons';
import {UserHeader} from '#src/Structs/ControllerStructs';

interface AdminUserManageListProps {
  users: UserHeader[] | undefined;
  onPressUser: (user: UserHeader) => void;
  onAdd?: (user: UserHeader) => void;
  onRemove?: (user: UserHeader) => void;
  canModify: boolean;
  searchTestID: string;
  searchLabel: string;
  emptyText: string;
}

/**
 * User list with optional add-by-search and remove actions for access-level and role screens.
 */
export const AdminUserManageList = ({
  users,
  onPressUser,
  onAdd,
  onRemove,
  canModify,
  searchTestID,
  searchLabel,
  emptyText,
}: AdminUserManageListProps) => {
  return (
    <>
      {canModify && onAdd && (
        <PaddedContentView padTop={true}>
          <UserMatchSearchBar
            testID={searchTestID}
            label={searchLabel}
            excludeHeaders={users ?? []}
            excludeSelf={false}
            clearOnPress={true}
            onPress={onAdd}
          />
        </PaddedContentView>
      )}
      {!users?.length && (
        <PaddedContentView padTop={!canModify}>
          <Text>{emptyText}</Text>
        </PaddedContentView>
      )}
      {users?.map(user => (
        <UserListItem
          key={user.userID}
          userHeader={user}
          onPress={() => onPressUser(user)}
          buttonIcon={canModify && onRemove ? AppIcons.delete : undefined}
          buttonOnPress={canModify && onRemove ? onRemove : undefined}
        />
      ))}
    </>
  );
};
