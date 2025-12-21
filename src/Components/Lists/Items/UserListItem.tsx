import React from 'react';
import {StyleSheet, View} from 'react-native';
import {IconButton, List} from 'react-native-paper';
import {IconSource} from 'react-native-paper/lib/typescript/components/Icon';

import {UserAvatarImage} from '#src/Components/Images/UserAvatarImage';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {UserHeader} from '#src/Structs/ControllerStructs';

interface UserListItemProps {
  onPress?: () => void;
  userHeader: UserHeader;
  buttonOnPress?: (uh: UserHeader) => void;
  buttonIcon?: IconSource;
  disabled?: boolean;
}

/**
 * Generic List.Item for displaying a user. Takes a UserHeader and lets you add special features like an action button
 * or something that happens when you press it.
 */
export const UserListItem = ({userHeader, onPress, buttonOnPress, buttonIcon, disabled = false}: UserListItemProps) => {
  const {styleDefaults, commonStyles} = useStyles();
  const {appConfig} = useConfig();

  const styles = StyleSheet.create({
    // This has to account for some Paper bullshit where there is a secret View added when you define
    // a Right, and it has things that we can't override.
    item: {
      ...commonStyles.paddingHorizontalSmall,
      paddingVertical: 2,
    },
    avatar: {
      ...commonStyles.justifyCenter,
      ...(disabled ? commonStyles.opacityHalf : {}),
    },
    titleStyle: {
      ...(disabled ? commonStyles.opacityHalf : {}),
    },
    descriptionStyle: {
      ...(disabled ? commonStyles.opacityHalf : {}),
    },
  });

  const getAvatar = React.useCallback(
    () => (
      <View style={styles.avatar}>
        <UserAvatarImage userHeader={userHeader} forceIdenticon={appConfig.preRegistrationMode} />
      </View>
    ),
    [userHeader, styles.avatar, appConfig.preRegistrationMode],
  );

  const getActionButton = React.useCallback(() => {
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
  }, [buttonOnPress, buttonIcon, userHeader, styleDefaults.avatarSizeSmall]);

  return (
    <List.Item
      style={styles.item}
      title={userHeader.username}
      description={appConfig.preRegistrationMode ? undefined : userHeader.displayName}
      titleStyle={styles.titleStyle}
      descriptionStyle={styles.descriptionStyle}
      onPress={onPress}
      left={getAvatar}
      right={getActionButton}
      disabled={disabled}
    />
  );
};
