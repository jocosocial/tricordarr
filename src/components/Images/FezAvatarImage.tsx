import React from 'react';
import {Avatar} from 'react-native-paper';
import {useQuery} from '@tanstack/react-query';
import {apiQueryImageUri} from '../../libraries/Network/APIClient';
import {useUserData} from '../Context/Contexts/UserDataContext';
import {FezDataProps} from '../../libraries/Types';
import {styleDefaults} from '../../styles';

export const FezAvatarImage = ({fez}: FezDataProps) => {
  const {isLoggedIn, profilePublicData} = useUserData();

  const otherParticipants = fez.members?.participants.filter(p => p.userID !== profilePublicData.header.userID) || [];
  const avatarUserID = otherParticipants[0].userID ?? '';

  const {data: avatarImageUri} = useQuery({
    queryKey: [`/image/user/thumb/${avatarUserID}`],
    enabled: isLoggedIn && !!avatarUserID,
    queryFn: apiQueryImageUri,
  });

  if (otherParticipants.length > 1) {
    return <Avatar.Icon size={styleDefaults.avatarSize} icon="account-group" />;
  }

  if (!avatarImageUri) {
    return <Avatar.Icon size={styleDefaults.avatarSize} icon="account" />;
  }

  return <Avatar.Image size={styleDefaults.avatarSize} source={{uri: avatarImageUri}} />;
};
