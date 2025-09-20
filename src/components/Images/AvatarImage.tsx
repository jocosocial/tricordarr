import React from 'react';
import {Avatar} from 'react-native-paper';

import {useFeature} from '#src/Context/Contexts/FeatureContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {AppIcons} from '#src/Enums/Icons';
import {useImageQuery} from '#src/Queries/ImageQuery';
import {styleDefaults} from '#src/Styles';

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
