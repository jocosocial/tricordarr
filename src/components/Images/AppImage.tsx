import React from 'react';
import {Avatar} from 'react-native-paper';
import {useQuery} from '@tanstack/react-query';
import {apiQueryImageUri} from '../../libraries/Network/APIClient';
import {useUserData} from '../Context/Contexts/UserDataContext';
import {Image, ImageStyle, StyleProp} from 'react-native';

type AppImageProps = {
  path: string;
  style?: StyleProp<ImageStyle>;
};

export const AppImage = ({path, style}: AppImageProps) => {
  const {isLoggedIn} = useUserData();

  const {data: imageUri} = useQuery({
    queryKey: [path],
    enabled: isLoggedIn && !!path,
    queryFn: apiQueryImageUri,
  });

  if (!imageUri) {
    return <Avatar.Icon style={style} icon="alert-circle-outline" />;
  }

  return <Image style={style} source={{uri: imageUri}} />;
};
