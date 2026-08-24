import React from 'react';
import {TouchableOpacity} from 'react-native';
import {Avatar} from 'react-native-paper';

import {AvatarImage} from '#src/Components/Images/AvatarImage';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {FezType} from '#src/Enums/FezType';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {FezData} from '#src/Structs/ControllerStructs';

interface FezAvatarImageProps {
  fez: FezData;
}

export const FezAvatarImage = ({fez}: FezAvatarImageProps) => {
  const {styleDefaults} = useStyles();
  const {currentUserID} = useSession();
  const commonNavigation = useCommonStack();
  const {theme} = useAppTheme();

  if (FezType.isLFGType(fez.fezType)) {
    return <Avatar.Icon size={styleDefaults.avatarSize} icon={AppIcons.lfg} color={theme.colors.background} />;
  }
  if (fez.fezType === FezType.privateEvent) {
    return (
      <Avatar.Icon size={styleDefaults.avatarSize} icon={AppIcons.personalEvent} color={theme.colors.background} />
    );
  }

  const otherParticipants = fez.members?.participants.filter(p => p.userID !== currentUserID) || [];

  // More than 1 other person makes this a group chat.
  // 0 others is probably an error but to deal with it, we make it a chat with yourself.
  if (otherParticipants.length > 1) {
    return <Avatar.Icon size={styleDefaults.avatarSize} icon={AppIcons.group} color={theme.colors.background} />;
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
