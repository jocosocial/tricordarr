import React from 'react';
import {View} from 'react-native';

import {UserListItem} from '#src/Components/Lists/Items/UserListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {SearchBarBase} from '#src/Components/Search/SearchBarBase';
import {useUserMatchQuery} from '#src/Queries/Users/UsersQueries';
import {UserHeader} from '#src/Structs/ControllerStructs';

interface UserSearchBarProps {
  excludeHeaders?: UserHeader[];
  onPress: (user: UserHeader) => void;
  clearOnPress?: boolean;
  dataHeaders?: UserHeader[];
  useProvidedData?: boolean;
  favorers?: boolean;
  label?: string;
}

/**
 * Search widget to find a user and do something with them. Works on a partial search string. Displays
 * users as List.Items below the search bar.
 * @param userHeaders Array of the UserHeaders that should be excluded from the search results.
 */
export const UserSearchBar = ({
  excludeHeaders = [],
  onPress,
  clearOnPress = false,
  favorers = false,
  label = 'Search for users',
}: UserSearchBarProps) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const {data} = useUserMatchQuery({searchQuery: searchQuery, favorers: favorers});

  const onChangeSearch = (query: string) => setSearchQuery(query);

  const handlePress = (user: UserHeader) => {
    onPress(user);
    if (clearOnPress) {
      setSearchQuery('');
    }
  };

  const onClear = () => {
    setSearchQuery('');
  };

  // The query hook automatically searches when searchQuery.length >= 2 (via enabled condition)
  // So we use autoSearch mode but don't need to provide onSearch since the query is reactive
  // https://stackoverflow.com/questions/8668174/indexof-method-in-an-object-array
  return (
    <View>
      <SearchBarBase
        placeholder={label}
        searchQuery={searchQuery}
        onChangeSearch={onChangeSearch}
        onClear={onClear}
        minLength={2}
        autoSearch={true}
      />
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
    </View>
  );
};
