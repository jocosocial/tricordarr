import React from 'react';
import {Avatar} from 'react-native-paper';
import {FezData} from '../../libraries/Structs/ControllerStructs';
import {useQuery} from '@tanstack/react-query';
import {apiQueryImageUri} from '../../libraries/Network/APIClient';
import {useUserData} from '../Context/Contexts/UserDataContext';

interface FezImageProps {
  fez: FezData;
}

export const FezImage = ({fez}: FezImageProps) => {
  const {isLoggedIn, profilePublicData} = useUserData();

  const otherParticipants = fez.members?.participants.filter(p => p.userID !== profilePublicData.header.userID) || [];
  const avatarUserID = otherParticipants[0].userID ?? '';

  const {data: avatarImageUri} = useQuery({
    queryKey: [`/image/user/thumb/${avatarUserID}`],
    enabled: isLoggedIn && !!avatarUserID,
    queryFn: apiQueryImageUri,
  });

  if (otherParticipants.length > 1) {
    return <Avatar.Icon size={36} icon="account-group" />;
  }

  if (!avatarImageUri) {
    return <Avatar.Icon size={36} icon="account" />;
  }

  return <Avatar.Image size={36} source={{uri: avatarImageUri}} />;
};
