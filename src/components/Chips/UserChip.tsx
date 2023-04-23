import React from 'react';
import {Chip} from 'react-native-paper';
import {UserAvatarImage} from '../Images/UserAvatarImage';
import {useStyles} from '../Context/Contexts/StyleContext';
import {UserHeader} from '../../libraries/Structs/ControllerStructs';

type UserChipProps = {
  onClose?: () => void;
  disabled?: boolean;
  userHeader: UserHeader;
};

export const UserChip = ({userHeader, onClose, disabled}: UserChipProps) => {
  const {commonStyles} = useStyles();
  const styles = [commonStyles.marginRightSmall, commonStyles.marginBottomSmall];

  const getAvatar = () => <UserAvatarImage userID={userHeader.userID} />;

  return (
    <Chip style={styles} icon={getAvatar} disabled={disabled} onClose={onClose}>
      {userHeader.username}
    </Chip>
  );
};
