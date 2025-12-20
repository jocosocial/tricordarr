import React from 'react';

import {UserSearchBarBaseComponent} from '#src/Components/Search/UserSearchBar/UserSearchBarBase';
import {UserSearchBarProps} from '#src/Components/Search/UserSearchBar/UserSearchBarTypes';
import {useUserSearchBar} from '#src/Components/Search/UserSearchBar/useUserSearchBar';
import {useUserMatchQuery} from '#src/Queries/Users/UsersQueries';

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
}: UserSearchBarProps) => {
  const {searchQuery, onChangeSearch, handlePress, onClear} = useUserSearchBar({
    onPress,
    clearOnPress,
  });

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

  return (
    <UserSearchBarBaseComponent
      searchQuery={searchQuery}
      onChangeSearch={onChangeSearch}
      onClear={onClear}
      handlePress={handlePress}
      data={data}
      refetch={refetch}
      excludeHeaders={excludeHeaders}
      label={label}
      autoSearch={autoSearch}
    />
  );
};
