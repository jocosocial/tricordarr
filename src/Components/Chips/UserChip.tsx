import React from 'react';
import {Chip} from 'react-native-paper';

import {AvatarImage} from '#src/Components/Images/AvatarImage';
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

  const getAvatar = React.useCallback(() => <AvatarImage userHeader={userHeader} />, [userHeader]);

  return (
    <Chip style={commonStyles.chip} icon={getAvatar} disabled={disabled} onClose={onClose} onPress={onPress}>
      {userHeader.username}
    </Chip>
  );
};
