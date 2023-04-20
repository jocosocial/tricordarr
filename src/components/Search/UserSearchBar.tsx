import React from 'react';
import {View} from 'react-native';
import {Searchbar} from 'react-native-paper';
import {useQuery} from '@tanstack/react-query';
import {UserHeader} from '../../libraries/Structs/ControllerStructs';
import {ListSection} from '../Lists/ListSection';
import {UserListItem} from '../Lists/Items/UserListItem';

interface UserSearchBarProps {
  participants: UserHeader[];
  setParticipants: React.Dispatch<React.SetStateAction<UserHeader[]>>;
}

export const UserSearchBar = ({participants, setParticipants}: UserSearchBarProps) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  let {data} = useQuery<UserHeader[]>({
    queryKey: [`/users/match/allnames/${searchQuery}`],
    enabled: searchQuery.length >= 2,
  });

  const onChangeSearch = (query: string) => setSearchQuery(query);

  const addParticipant = (user: UserHeader) => {
    // https://stackoverflow.com/questions/1988349/array-push-if-does-not-exist
    const existingIndex = participants.findIndex(item => item.userID === user.userID);
    if (existingIndex === -1) {
      setParticipants(participants.concat([user]));
    }
  };

  // https://stackoverflow.com/questions/8668174/indexof-method-in-an-object-array
  return (
    <View>
      <Searchbar placeholder={'Search for users'} onChangeText={onChangeSearch} value={searchQuery} />
      <ListSection>
        {data &&
          data
            // data (the search results) gets filtered to remove participants
            // that are already present (participants.indexOf "exists")
            .filter(user => participants.map(p => p.userID).indexOf(user.userID) === -1)
            .flatMap(user => <UserListItem key={user.userID} userHeader={user} onPress={() => addParticipant(user)} />)}
      </ListSection>
    </View>
  );
};
