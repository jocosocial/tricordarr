import React from 'react';
import {Avatar} from 'react-native-paper';
import {styleDefaults} from '../../Styles';
import {AppIcons} from '../../Libraries/Enums/Icons';
import {useImageQuery} from '../Queries/ImageQuery';
import {useFeature} from '../Context/Contexts/FeatureContext';
import {SwiftarrFeature} from '../../Libraries/Enums/AppFeatures';

type AvatarImageProps = {
  imageName: string;
  small?: boolean;
  icon?: string;
};

// @TODO resolve this with UserAvatarImage
export const AvatarImage = ({imageName, small = false, icon = AppIcons.user}: AvatarImageProps) => {
  const size = small ? styleDefaults.avatarSizeSmall : styleDefaults.avatarSize;
  const {getIsDisabled} = useFeature();
  const isDisabled = getIsDisabled(SwiftarrFeature.images);

  const {data} = useImageQuery(`/image/thumb/${imageName}`, !isDisabled && !!imageName);

  if (!data || isDisabled) {
    return <Avatar.Icon size={size} icon={icon} />;
  }

  return <Avatar.Image size={size} source={{uri: data.dataURI}} />;
};
