import React from 'react';
import {Avatar} from 'react-native-paper';
import {Image, ImageStyle, StyleProp} from 'react-native';
import {AppIcons} from '../../libraries/Enums/Icons';
import {useImageQuery} from '../Queries/ImageQuery';

type AppImageProps = {
  path: string;
  style?: StyleProp<ImageStyle>;
};

export const AppImage = ({path, style}: AppImageProps) => {
  const {data: imageUri} = useImageQuery(path);
  console.log('Rendering AppImage');

  if (!imageUri) {
    return <Avatar.Icon style={style} icon={AppIcons.error} />;
  }

  return <Image style={style} source={{uri: imageUri}} />;
};
