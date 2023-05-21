import React from 'react';
import {Avatar} from 'react-native-paper';
import {styleDefaults} from '../../styles';
import {AppIcons} from '../../libraries/Enums/Icons';
import {useImageQuery} from '../Queries/ImageQuery';

type UserAvatarImageProps = {
  userID?: string;
  small?: boolean;
  icon?: string;
};

export const UserAvatarImage = ({userID, small = false, icon = AppIcons.user}: UserAvatarImageProps) => {
  const size = small ? styleDefaults.avatarSizeSmall : styleDefaults.avatarSize;
  const {data: avatarImageUri} = useImageQuery(`/image/user/thumb/${userID}`);

  if (!avatarImageUri) {
    return <Avatar.Icon size={size} icon={icon} />;
  }

  return <Avatar.Image size={size} source={{uri: avatarImageUri}} />;
};
