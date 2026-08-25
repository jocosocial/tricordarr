import React from 'react';

import {UserSearchBarBaseComponent} from '#src/Components/Search/UserSearchBar/UserSearchBarBase';
import {UserSearchBarProps} from '#src/Components/Search/UserSearchBar/UserSearchBarTypes';
import {useUserSearchBar} from '#src/Components/Search/UserSearchBar/useUserSearchBar';
import {TokenAuthQueryOptionsType} from '#src/Queries/TokenAuthQuery';
import {useUserFindQuery} from '#src/Queries/Users/UsersQueries';
import {UserHeader} from '#src/Structs/ControllerStructs';

interface UserFindSearchBarProps extends UserSearchBarProps {
  /**
   * Optional React Query options for the exact-name lookup.
   * Merged after `{enabled: false}` so callers can override retry, etc.
   */
  queryOptions?: TokenAuthQueryOptionsType<UserHeader | null>;
}

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
  queryOptions,
}: UserFindSearchBarProps) => {
  const {searchQuery, onChangeSearch, handlePress, onClear} = useUserSearchBar({
    onPress,
    clearOnPress,
  });

  // Manual search only. 404-as-not-found is handled in useUserFindQuery.
  // Screen/callers can override query behavior via queryOptions.
  const {data, refetch} = useUserFindQuery(searchQuery, {
    enabled: false,
    ...queryOptions,
  });

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
