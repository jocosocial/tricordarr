import React from 'react';
import {Avatar} from 'react-native-paper';

import {APIImage} from '#src/Components/Images/APIImage';
import {useFeature} from '#src/Context/Contexts/FeatureContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {AppIcons} from '#src/Enums/Icons';
import {UserHeader} from '#src/Structs/ControllerStructs';

type AvatarImageProps = {
  /**
   * Pass a UserHeader for user avatars. This will handle identicon logic automatically.
   */
  userHeader?: UserHeader;
  /**
   * Pass a raw image name for non-user avatars (e.g., performer images).
   * Takes precedence if both userHeader and imageName are provided.
   */
  imageName?: string;
  /**
   * Use small avatar size (styleDefaults.avatarSizeSmall).
   */
  small?: boolean;
  /**
   * Fallback icon when images are disabled or unavailable.
   */
  icon?: string;
  /**
   * Force use of identicon even if userHeader.userImage exists.
   */
  forceIdenticon?: boolean;
};

/**
 * Unified avatar image component used to show a small user circle avatar.
 *
 * This component wraps APIImage for proper FastImage caching.
 * Supports both UserHeader-based avatars (with identicon fallback) and raw image name avatars.
 */
export const AvatarImage = ({
  userHeader,
  imageName,
  small = false,
  icon = AppIcons.user,
  forceIdenticon = false,
}: AvatarImageProps) => {
  const {styleDefaults} = useStyles();
  const size = small ? styleDefaults.avatarSizeSmall : styleDefaults.avatarSize;
  const {getIsDisabled} = useFeature();
  const isDisabled = getIsDisabled(SwiftarrFeature.images);

  // Determine the image path and whether to use identicon
  let path: string | undefined;
  let useIdenticon = false;

  if (imageName) {
    // Raw image name takes precedence
    path = imageName;
  } else if (userHeader) {
    if (forceIdenticon || !userHeader.userImage) {
      // Use identicon for this user
      path = userHeader.userID;
      useIdenticon = true;
    } else {
      // Use the user's actual avatar image
      path = userHeader.userImage;
    }
  }

  // Show fallback icon if images are disabled or no path available
  if (isDisabled || !path) {
    return <Avatar.Icon size={size} icon={icon} />;
  }

  return (
    <APIImage
      path={path}
      mode={'avatar'}
      size={size}
      staticSize={useIdenticon ? 'identicon' : 'thumb'}
      disableTouch={true}
    />
  );
};
