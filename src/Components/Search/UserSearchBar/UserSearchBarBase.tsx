import React from 'react';
import {View} from 'react-native';

import {SearchBarBase} from '#src/Components/Search/SearchBarBase';
import {UserSearchBarResults} from '#src/Components/Search/UserSearchBar/UserSearchBarResults';
import {UserHeader} from '#src/Structs/ControllerStructs';

interface UserSearchBarBaseProps {
  /**
   * Current search query string
   */
  searchQuery: string;
  /**
   * Handler for search query changes
   */
  onChangeSearch: (query: string) => void;
  /**
   * Handler for clear action
   */
  onClear: () => void;
  /**
   * Handler for user selection
   */
  handlePress: (user: UserHeader) => void;
  /**
   * Query result data - optional array of UserHeaders
   */
  data?: UserHeader[];
  /**
   * Refetch function from the query hook
   */
  refetch: () => void;
  /**
   * Users to exclude from results
   */
  excludeHeaders?: UserHeader[];
  /**
   * Search bar label/placeholder
   */
  label?: string;
  /**
   * Whether to auto-search as user types
   */
  autoSearch?: boolean;
}

/**
 * Base component for user search bars. Handles common UI rendering.
 * Specific search bar components should use this and provide their own query hooks and state management.
 */
export const UserSearchBarBaseComponent = ({
  searchQuery,
  onChangeSearch,
  onClear,
  handlePress,
  data,
  refetch,
  excludeHeaders = [],
  label = 'Search for users',
  autoSearch = true,
}: UserSearchBarBaseProps) => {
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
