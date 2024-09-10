import React from 'react';
import {Avatar} from 'react-native-paper';
import {styleDefaults} from '../../styles';
import {AppIcons} from '../../libraries/Enums/Icons';
import {useImageQuery} from '../Queries/ImageQuery';
import {useFeature} from '../Context/Contexts/FeatureContext';
import {SwiftarrFeature} from '../../libraries/Enums/AppFeatures';
import {UserHeader} from '../../libraries/Structs/ControllerStructs';

type UserAvatarImageProps = {
  userHeader?: UserHeader;
  small?: boolean;
  icon?: string;
};

/**
 * Image component for little user circles. This behaves fundamentally differently than APIImage with
 * the whole identicon thing. Plus they are always small so no need to fetch the big version here.
 * @param userHeader
 * @param small
 * @param icon
 * @constructor
 */
export const UserAvatarImage = ({userHeader, small = false, icon = AppIcons.user}: UserAvatarImageProps) => {
  const size = small ? styleDefaults.avatarSizeSmall : styleDefaults.avatarSize;
  const {getIsDisabled} = useFeature();
  const isDisabled = getIsDisabled(SwiftarrFeature.images);

  const imagePath = userHeader
    ? userHeader.userImage
      ? `/image/thumb/${userHeader.userImage}`
      : `/image/user/identicon/${userHeader.userID}`
    : '';
  const {data} = useImageQuery(imagePath, !isDisabled && !!imagePath);

  if (!data || isDisabled) {
    return <Avatar.Icon size={size} icon={icon} />;
  }

  return <Avatar.Image size={size} source={{uri: data.dataURI}} />;
};
