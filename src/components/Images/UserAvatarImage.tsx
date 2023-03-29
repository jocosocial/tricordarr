import React from 'react';
import {Avatar} from 'react-native-paper';
import {useQuery} from '@tanstack/react-query';
import {apiQueryImageUri} from '../../libraries/Network/APIClient';
import {useUserData} from '../Context/Contexts/UserDataContext';
import {styleDefaults} from '../../styles';

type UserAvatarImageProps = {
  userID: string;
  small?: boolean;
};

export const UserAvatarImage = ({userID, small = false}: UserAvatarImageProps) => {
  const {isLoggedIn} = useUserData();
  const size = small ? styleDefaults.avatarSize * (2 / 3) : styleDefaults.avatarSize;

  const {data: avatarImageUri} = useQuery({
    queryKey: [`/image/user/thumb/${userID}`],
    enabled: isLoggedIn && !!userID,
    queryFn: apiQueryImageUri,
  });

  if (!avatarImageUri) {
    return <Avatar.Icon size={size} icon="account" />;
  }

  return <Avatar.Image size={size} source={{uri: avatarImageUri}} />;
};
