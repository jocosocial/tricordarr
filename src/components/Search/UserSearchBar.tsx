import React from 'react';
import {View} from 'react-native';
import {HelperText, Searchbar} from 'react-native-paper';
import {UserHeader} from '../../Libraries/Structs/ControllerStructs.tsx';
import {ListSection} from '../Lists/ListSection.tsx';
import {UserListItem} from '../Lists/Items/UserListItem.tsx';

import {useUserMatchQuery} from '../Queries/Users/UsersQueries.ts';

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

  const showHelper = searchQuery.length < 2 && searchQuery !== '';

  // https://stackoverflow.com/questions/8668174/indexof-method-in-an-object-array
  return (
    <View>
      <Searchbar placeholder={label} onChangeText={onChangeSearch} value={searchQuery} />
      {showHelper && <HelperText type={'error'}>Must enter at least two characters to search.</HelperText>}
      <ListSection>
        {data &&
          data
            // data (the search results) gets filtered to remove headers
            // that are already present (userHeaders.indexOf "exists")
            .filter(user => excludeHeaders.map(p => p.userID).indexOf(user.userID) === -1)
            .flatMap(user => <UserListItem key={user.userID} userHeader={user} onPress={() => handlePress(user)} />)}
      </ListSection>
    </View>
  );
};
