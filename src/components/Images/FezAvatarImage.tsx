import React from 'react';
import {Avatar} from 'react-native-paper';
import {useUserData} from '../Context/Contexts/UserDataContext';
import {FezDataProps} from '../../libraries/Types';
import {styleDefaults} from '../../styles';
import {UserAvatarImage} from './UserAvatarImage';
import {AppIcons} from '../../libraries/Enums/Icons';

export const FezAvatarImage = ({fez}: FezDataProps) => {
  const {profilePublicData} = useUserData();

  const otherParticipants = fez.members?.participants.filter(p => p.userID !== profilePublicData.header.userID) || [];
  const avatarUserID = otherParticipants[0].userID ?? '';

  if (otherParticipants.length > 1) {
    return <Avatar.Icon size={styleDefaults.avatarSize} icon={AppIcons.group} />;
  }

  return <UserAvatarImage userID={avatarUserID} />;
};
