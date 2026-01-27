import React from 'react';
import {TouchableOpacity} from 'react-native';
import {Avatar} from 'react-native-paper';

import {AvatarImage} from '#src/Components/Images/AvatarImage';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';
import {FezData} from '#src/Structs/ControllerStructs';
import {styleDefaults} from '#src/Styles';

interface FezAvatarImageProps {
  fez: FezData;
}

export const FezAvatarImage = ({fez}: FezAvatarImageProps) => {
  const {currentUserID} = useSession();
  const commonNavigation = useCommonStack();
  const otherParticipants = fez.members?.participants.filter(p => p.userID !== currentUserID) || [];

  // More than 1 other person makes this a group chat.
  // 0 others is probably an error but to deal with it, we make it a chat with yourself.
  if (otherParticipants.length > 1) {
    return <Avatar.Icon size={styleDefaults.avatarSize} icon={AppIcons.group} />;
  } else if (otherParticipants.length === 0) {
    return <Avatar.Icon size={styleDefaults.avatarSize} icon={AppIcons.error} />;
  }

  const onPress = () => {
    commonNavigation.push(CommonStackComponents.userProfileScreen, {
      userID: otherParticipants[0].userID,
    });
  };

  return (
    <TouchableOpacity onPress={onPress}>
      <AvatarImage userHeader={otherParticipants[0]} />
    </TouchableOpacity>
  );
};
