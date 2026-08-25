import React from 'react';

import {UserSearchBarBaseComponent} from '#src/Components/Search/UserSearchBar/UserSearchBarBase';
import {UserSearchBarProps} from '#src/Components/Search/UserSearchBar/UserSearchBarTypes';
import {useUserSearchBar} from '#src/Components/Search/UserSearchBar/useUserSearchBar';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {shouldRetryQuery} from '#src/Libraries/Network/QueryRetry';
import {TokenAuthQueryOptionsType} from '#src/Queries/TokenAuthQuery';
import {useUserFindQuery} from '#src/Queries/Users/UsersQueries';
import {UserHeader} from '#src/Structs/ControllerStructs';

interface UserFindSearchBarProps extends UserSearchBarProps {
  /**
   * Optional React Query options for the exact-name lookup.
   * Merged after the 404-aware defaults so callers can override retry, etc.
   */
  queryOptions?: TokenAuthQueryOptionsType<UserHeader | null>;
}

/**
 * Search widget to find a user by exact username. Used during preregistration
 * favoriting, where a miss is an HTTP 404. That 404 is treated as not-found
 * (no retry). Displays matching users as List.Items below the search bar.
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
  const {appConfig} = useConfig();
  const {searchQuery, onChangeSearch, handlePress, onClear} = useUserSearchBar({
    onPress,
    clearOnPress,
  });

  // Manual search only (autoSearch is false). 404s are not retried; other
  // failures still use the configured retry count. Screen/callers can override
  // via queryOptions.
  const {data, refetch} = useUserFindQuery(searchQuery, {
    enabled: false,
    retry: (failureCount, error) => shouldRetryQuery(failureCount, error, appConfig.apiClientConfig.retry),
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
