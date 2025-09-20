import React from 'react';
import {Avatar} from 'react-native-paper';
import {styleDefaults} from '#src/Styles';
import {AppIcons} from '#src/Libraries/Enums/Icons';
import {useImageQuery} from '#src/Components/Queries/ImageQuery';
import {useFeature} from '#src/Components/Context/Contexts/FeatureContext';
import {SwiftarrFeature} from '#src/Libraries/Enums/AppFeatures';
import {UserHeader} from '#src/Libraries/Structs/ControllerStructs';

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
