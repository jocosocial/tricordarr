import React from 'react';
import {Chip} from 'react-native-paper';
import {UserAvatarImage} from '../Images/UserAvatarImage';
import {useStyles} from '../Context/Contexts/StyleContext';
import {UserHeader} from '../../Libraries/Structs/ControllerStructs';

type UserChipProps = {
  onClose?: () => void;
  disabled?: boolean;
  userHeader: UserHeader;
  onPress?: () => void;
};

export const UserChip = ({userHeader, onClose, disabled, onPress}: UserChipProps) => {
  const {commonStyles} = useStyles();
  const styles = [commonStyles.marginRightSmall, commonStyles.marginBottomSmall];

  const getAvatar = () => <UserAvatarImage userHeader={userHeader} />;

  return (
    <Chip style={styles} icon={getAvatar} disabled={disabled} onClose={onClose} onPress={onPress}>
      {userHeader.username}
    </Chip>
  );
};
