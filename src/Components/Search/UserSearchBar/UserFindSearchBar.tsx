import React from 'react';

import {UserSearchBarBaseComponent} from '#src/Components/Search/UserSearchBar/UserSearchBarBase';
import {UserSearchBarProps} from '#src/Components/Search/UserSearchBar/UserSearchBarTypes';
import {useUserSearchBar} from '#src/Components/Search/UserSearchBar/useUserSearchBar';
import {useUserFindQuery} from '#src/Queries/Users/UsersQueries';

/**
 * Search widget to find a user and do something with them. Works on a partial search string. Displays
 * users as List.Items below the search bar.
 * @param userHeaders Array of the UserHeaders that should be excluded from the search results.
 */
export const UserFindSearchBar = ({
  excludeHeaders = [],
  onPress,
  clearOnPress = false,
  label = 'Search for users',
}: UserSearchBarProps) => {
  const {searchQuery, onChangeSearch, handlePress, onClear} = useUserSearchBar({
    onPress,
    clearOnPress,
  });

  // autoSearchLength should be undefined, but the important part is setting
  // enabled: false when we disable autoSearch (autoSearch: false).
  const {data, refetch} = useUserFindQuery(searchQuery, {enabled: false});

  return (
    <UserSearchBarBaseComponent
      searchQuery={searchQuery}
      onChangeSearch={onChangeSearch}
      onClear={onClear}
      handlePress={handlePress}
      data={data ? [data] : undefined}
      refetch={refetch}
      excludeHeaders={excludeHeaders}
      label={label}
      autoSearch={false}
    />
  );
};
