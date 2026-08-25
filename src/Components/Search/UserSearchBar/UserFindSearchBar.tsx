import React from 'react';

import {UserSearchBarBaseComponent} from '#src/Components/Search/UserSearchBar/UserSearchBarBase';
import {UserSearchBarProps} from '#src/Components/Search/UserSearchBar/UserSearchBarTypes';
import {useUserSearchBar} from '#src/Components/Search/UserSearchBar/useUserSearchBar';
import {useUserFindQuery} from '#src/Queries/Users/UsersQueries';

/**
 * Search widget to find a user by exact username. Used during preregistration
 * favoriting, where a miss is an HTTP 404 handled by `useUserFindQuery`.
 * Displays matching users as List.Items below the search bar.
 */
export const UserFindSearchBar = ({
  excludeHeaders = [],
  onPress,
  clearOnPress = false,
  label = 'Enter exact username',
  excludeSelf = true,
  testID,
}: UserSearchBarProps) => {
  const {searchQuery, onChangeSearch, handlePress, onClear} = useUserSearchBar({
    onPress,
    clearOnPress,
  });

  // Manual search only. 404-as-not-found is handled in useUserFindQuery.
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
      excludeSelf={excludeSelf}
      testID={testID}
    />
  );
};
