import React from 'react';
import {View} from 'react-native';

import {UserListItem} from '#src/Components/Lists/Items/UserListItem';
import {ListSection} from '#src/Components/Lists/ListSection';
import {SearchBarBase} from '#src/Components/Search/SearchBarBase';
import {useUserMatchQuery} from '#src/Queries/Users/UsersQueries';
import {UserHeader} from '#src/Structs/ControllerStructs';

interface UserMatchSearchBarProps {
  excludeHeaders?: UserHeader[];
  onPress: (user: UserHeader) => void;
  clearOnPress?: boolean;
  dataHeaders?: UserHeader[];
  useProvidedData?: boolean;
  favorers?: boolean;
  label?: string;
  autoSearch?: boolean;
}

/**
 * Search widget to find a user and do something with them. Works on a partial search string. Displays
 * users as List.Items below the search bar.
 * @param userHeaders Array of the UserHeaders that should be excluded from the search results.
 */
export const UserMatchSearchBar = ({
  excludeHeaders = [],
  onPress,
  clearOnPress = false,
  favorers = false,
  label = 'Search for users',
  autoSearch = true,
}: UserMatchSearchBarProps) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  // autoSearchLength should be undefined, but the important part is setting
  // enabled: false when we disable autoSearch (autoSearch: false).
  const {data, refetch} = useUserMatchQuery({
    searchQuery: searchQuery,
    favorers: favorers,
    autoSearchLength: autoSearch ? 2 : undefined,
    options: {
      ...(autoSearch ? {} : {enabled: false}),
    },
  });

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
        autoSearch={autoSearch}
        onSearch={autoSearch ? undefined : refetch}
      />
      <UserSearchBarResults data={data} excludeHeaders={excludeHeaders} handlePress={handlePress} />
    </View>
  );
};

interface UserSearchBarResultsProps {
  data?: UserHeader[];
  excludeHeaders: UserHeader[];
  handlePress: (user: UserHeader) => void;
}

const UserSearchBarResults = ({data, excludeHeaders, handlePress}: UserSearchBarResultsProps) => {
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
