import React from 'react';
import {Chip} from 'react-native-paper';

import {UserAvatarImage} from '#src/Components/Images/UserAvatarImage';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {UserHeader} from '#src/Structs/ControllerStructs';

type UserChipProps = {
  onClose?: () => void;
  disabled?: boolean;
  userHeader: UserHeader;
  onPress?: () => void;
};

export const UserChip = ({userHeader, onClose, disabled, onPress}: UserChipProps) => {
  const {commonStyles} = useStyles();

  const getAvatar = () => <UserAvatarImage userHeader={userHeader} />;

  return (
    <Chip style={commonStyles.chip} icon={getAvatar} disabled={disabled} onClose={onClose} onPress={onPress}>
      {userHeader.username}
    </Chip>
  );
};
