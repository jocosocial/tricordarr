import React from 'react';
import {List} from 'react-native-paper';
import {commonStyles} from '../../../styles';
import {UserAvatarImage} from '../../Images/UserAvatarImage';
import {UserHeader} from '../../../libraries/Structs/ControllerStructs';

interface UserListItemProps {
  onPress?: () => void;
  userHeader: UserHeader;
}

export const UserListItem = ({userHeader, onPress}: UserListItemProps) => {
  const styles = {
    item: [commonStyles.paddingSides],
  };

  const getAvatar = () => <UserAvatarImage userID={userHeader.userID} />;

  return (
    <List.Item
      style={styles.item}
      title={userHeader.username}
      description={userHeader.displayName}
      onPress={onPress}
      left={getAvatar}
    />
  );
};
