import React from 'react';

import {UserListItem} from '#src/Components/Lists/Items/UserListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {usePreRegistration} from '#src/Context/Contexts/PreRegistrationContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useUserHeader} from '#src/Context/Contexts/UserHeaderContext';
import {useUserFavoritesQuery} from '#src/Queries/Users/UserFavoriteQueries';
import {UserHeader} from '#src/Structs/ControllerStructs';

/**
 * Props for the UserSearchBarResults component
 */
interface UserSearchBarResultsProps {
  data?: UserHeader[];
  excludeHeaders: UserHeader[];
  handlePress: (user: UserHeader) => void;
  excludeSelf?: boolean;
}

/**
 * Returns true when the given user should not be selectable in the results list.
 * A user is excluded when:
 * - excludeSelf is true and the user is the current session's user (uses session userID, not profile query), or
 * - the user appears in the excludeHeaders list (e.g. already-selected participants).
 * Excluded users are shown but disabled so the list stays predictable.
 */
function isExcluded(
  user: UserHeader,
  excludeSelf: boolean,
  currentUserID: string | null,
  excludeHeaders: UserHeader[],
): boolean {
  if (excludeSelf && currentUserID != null && user.userID === currentUserID) {
    return true;
  }
  return excludeHeaders.some(excluded => excluded.userID === user.userID);
}

/**
 * Shared results component for displaying user search results
 */
export const UserSearchBarResults = ({
  data,
  excludeHeaders,
  handlePress,
  excludeSelf = false,
}: UserSearchBarResultsProps) => {
  const {currentUserID} = useSession();
  const {preRegistrationMode} = usePreRegistration();
  // Queried once for the whole list rather than per row. Favorites are not a pre-registration
  // concept, so the request is skipped in that mode.
  const {data: favorites} = useUserFavoritesQuery({enabled: !preRegistrationMode});
  const {contains} = useUserHeader();

  return (
    <ListSection>
      {data &&
        data.map(user => {
          const excluded = isExcluded(user, excludeSelf, currentUserID, excludeHeaders ?? []);
          return (
            <UserListItem
              key={user.userID}
              userHeader={user}
              onPress={excluded ? undefined : () => handlePress(user)}
              disabled={excluded}
              isFavorite={contains(favorites, user)}
            />
          );
        })}
    </ListSection>
  );
};
