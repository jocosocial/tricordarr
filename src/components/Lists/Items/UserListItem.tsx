import React from 'react';
import {List} from 'react-native-paper';
import {commonStyles} from '../../../styles';
import {PropsWithUserHeader} from '../../../libraries/Types';
import {UserAvatarImage} from '../../Images/UserAvatarImage';

interface UserListItemProps {
  onPress?: () => void;
}

export const UserListItem = ({userHeader, onPress}: PropsWithUserHeader<UserListItemProps>) => {
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
