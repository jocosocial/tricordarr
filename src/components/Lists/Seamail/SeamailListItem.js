import React from 'react';
import {List, Avatar} from 'react-native-paper';
// import {useNavigation} from '@react-navigation/native';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {useQuery} from '@tanstack/react-query';
import {apiQueryImageUri} from '../../../libraries/Network/APIClient';

export const SeamailListItem = ({fez}) => {
  const {isLoggedIn} = useUserData();
  // const navigation = useNavigation();
  const {profilePublicData} = useUserData();

  const {data: avatarImageUri} = useQuery({
    queryKey: ['/image/user/thumb/5900EB22-3C9F-43DC-8257-1EF9E0F7965C'],
    enabled: !!isLoggedIn,
    queryFn: apiQueryImageUri,
  });

  console.log(fez.owner);
  console.log(fez.members);

  function getDescription() {
    let description = '';
    fez.members.participants.map(participant => {
      if (participant.username !== profilePublicData.header.username) {
        description += participant.username;
      }
    });
    return description;
  }

  return (
    <List.Item
      title={fez.title}
      description={getDescription()}
      onPress={() => console.log('foo')}
      left={() => <Avatar.Image size={24} source={{uri: avatarImageUri}} />}
    />
  );
};
