import React from 'react';

import {UserSearchBarProps} from '#src/Components/Search/UserSearchBar/UserSearchBarTypes';
import {UserHeader} from '#src/Structs/ControllerStructs';

// Hey cool Cursor showed me something neat.
type Props = Pick<UserSearchBarProps, 'onPress' | 'clearOnPress'>;

/**
 * Common hook for user search bar state and handlers
 */
export const useUserSearchBar = ({onPress, clearOnPress = false}: Props) => {
  const [searchQuery, setSearchQuery] = React.useState('');

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

  return {
    searchQuery,
    onChangeSearch,
    handlePress,
    onClear,
  };
};
