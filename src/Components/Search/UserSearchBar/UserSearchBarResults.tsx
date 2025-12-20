import React from 'react';

import {UserListItem} from '#src/Components/Lists/Items/UserListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {UserHeader} from '#src/Structs/ControllerStructs';

/**
 * Props for the UserSearchBarResults component
 */
interface UserSearchBarResultsProps {
  data?: UserHeader[];
  excludeHeaders: UserHeader[];
  handlePress: (user: UserHeader) => void;
}

/**
 * Shared results component for displaying user search results
 */
export const UserSearchBarResults = ({data, excludeHeaders, handlePress}: UserSearchBarResultsProps) => {
  return (
    <ListSection>
      {data &&
        data.map(user => {
          const isExcluded = excludeHeaders.some(excluded => excluded.userID === user.userID);
          return (
            <UserListItem
              key={user.userID}
              userHeader={user}
              onPress={isExcluded ? undefined : () => handlePress(user)}
              disabled={isExcluded}
            />
          );
        })}
    </ListSection>
  );
};
