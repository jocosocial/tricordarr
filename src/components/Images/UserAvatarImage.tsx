import React from 'react';
import {Avatar} from 'react-native-paper';
import {styleDefaults} from '../../styles';
import {AppIcons} from '../../libraries/Enums/Icons';
import {useImageQuery} from '../Queries/ImageQuery';
import {ImageQueryData} from '../../libraries/Types';

type UserAvatarImageProps = {
  userID?: string;
  small?: boolean;
  icon?: string;
};

export const UserAvatarImage = ({userID, small = false, icon = AppIcons.user}: UserAvatarImageProps) => {
  const size = small ? styleDefaults.avatarSizeSmall : styleDefaults.avatarSize;
  const {data} = useImageQuery(`/image/user/thumb/${userID}`);

  if (!data) {
    return <Avatar.Icon size={size} icon={icon} />;
  }

  return <Avatar.Image size={size} source={{uri: ImageQueryData.toDataURI(data.base64, data.mimeType)}} />;
};
