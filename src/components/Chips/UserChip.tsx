import React from 'react';
import {Chip} from 'react-native-paper';
import {PropsWithUserHeader} from '../../libraries/Types';
import {UserAvatarImage} from '../Images/UserAvatarImage';
import {useStyles} from '../Context/Contexts/StyleContext';

type UserChipProps = {
  onClose?: () => void;
  disabled?: boolean;
};

export const UserChip = ({userHeader, onClose, disabled}: PropsWithUserHeader<UserChipProps>) => {
  const {commonStyles} = useStyles();
  const styles = [commonStyles.marginRightSmall, commonStyles.marginBottomSmall];

  const getAvatar = () => <UserAvatarImage userID={userHeader.userID} />;

  return (
    <Chip style={styles} icon={getAvatar} disabled={disabled} onClose={onClose}>
      {userHeader.username}
    </Chip>
  );
};
