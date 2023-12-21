import React from 'react';
import {IconButton, List} from 'react-native-paper';
import {UserAvatarImage} from '../../Images/UserAvatarImage';
import {UserHeader} from '../../../libraries/Structs/ControllerStructs';
import {IconSource} from 'react-native-paper/lib/typescript/components/Icon';
import {View} from 'react-native';
import {useStyles} from '../../Context/Contexts/StyleContext';

interface UserListItemProps {
  onPress?: () => void;
  userHeader: UserHeader;
  buttonOnPress?: (uh: UserHeader) => void;
  buttonIcon?: IconSource;
}

/**
 * Generic List.Item for displaying a user. Takes a UserHeader and lets you add special features like an action button
 * or something that happens when you press it.
 */
export const UserListItem = ({userHeader, onPress, buttonOnPress, buttonIcon}: UserListItemProps) => {
  const {styleDefaults, commonStyles} = useStyles();
  // This has to account for some Paper bullshit where there is a secret View added when you define
  // a Right, and it has things that we can't override.
  const styles = {
    item: [commonStyles.paddingHorizontal, {paddingVertical: 2}],
  };

  const getAvatar = () => (
    <View style={[commonStyles.justifyCenter]}>
      <UserAvatarImage userHeader={userHeader} />
    </View>
  );

  const getActionButton = () => {
    if (buttonOnPress && buttonIcon) {
      return (
        <IconButton
          mode={'outlined'}
          size={styleDefaults.avatarSizeSmall}
          icon={buttonIcon}
          onPress={() => buttonOnPress(userHeader)}
        />
      );
    }
  };

  return (
    <List.Item
      style={styles.item}
      title={userHeader.username}
      description={userHeader.displayName}
      onPress={onPress}
      left={getAvatar}
      right={getActionButton}
    />
  );
};
