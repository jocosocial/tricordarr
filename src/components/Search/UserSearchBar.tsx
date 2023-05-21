import React from 'react';
import {View} from 'react-native';
import {Searchbar} from 'react-native-paper';
import {UserHeader} from '../../libraries/Structs/ControllerStructs';
import {ListSection} from '../Lists/ListSection';
import {UserListItem} from '../Lists/Items/UserListItem';
import {useUserMatchQuery} from '../Queries/Users/UserMatchQueries';

interface UserSearchBarProps {
  userHeaders: UserHeader[];
  onPress: (user: UserHeader) => void;
}

export const UserSearchBar = ({userHeaders, onPress}: UserSearchBarProps) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const {data} = useUserMatchQuery(searchQuery);

  const onChangeSearch = (query: string) => setSearchQuery(query);

  const handlePress = (user: UserHeader) => onPress(user);

  // https://stackoverflow.com/questions/8668174/indexof-method-in-an-object-array
  return (
    <View>
      <Searchbar placeholder={'Search for users'} onChangeText={onChangeSearch} value={searchQuery} />
      <ListSection>
        {data &&
          data
            // data (the search results) gets filtered to remove headers
            // that are already present (userHeaders.indexOf "exists")
            .filter(user => userHeaders.map(p => p.userID).indexOf(user.userID) === -1)
            .flatMap(user => <UserListItem key={user.userID} userHeader={user} onPress={() => handlePress(user)} />)}
      </ListSection>
    </View>
  );
};
