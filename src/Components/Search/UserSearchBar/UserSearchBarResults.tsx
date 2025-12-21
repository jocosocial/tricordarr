import React from 'react';

import {UserListItem} from '#src/Components/Lists/Items/UserListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries';
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
 * Shared results component for displaying user search results
 */
export const UserSearchBarResults = ({
  data,
  excludeHeaders,
  handlePress,
  excludeSelf = false,
}: UserSearchBarResultsProps) => {
  const {data: profilePublicData} = useUserProfileQuery({enabled: excludeSelf});

  const excludeHeadersInternal = React.useMemo(
    () =>
      [excludeSelf ? profilePublicData?.header : undefined, ...(excludeHeaders ?? [])].filter(
        (header): header is UserHeader => header !== undefined,
      ),
    [excludeSelf, profilePublicData, excludeHeaders],
  );

  return (
    <ListSection>
      {data &&
        data.map(user => {
          const isExcluded = excludeHeadersInternal.some(excluded => excluded.userID === user.userID);
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
