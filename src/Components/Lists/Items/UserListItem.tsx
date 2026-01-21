import React from 'react';
import {StyleSheet, View} from 'react-native';
import {IconButton, List} from 'react-native-paper';
import {IconSource} from 'react-native-paper/lib/typescript/components/Icon';

import {UserAvatarImage} from '#src/Components/Images/UserAvatarImage';
import {usePreRegistration} from '#src/Context/Contexts/PreRegistrationContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {UserHeader} from '#src/Structs/ControllerStructs';

interface ActionButton {
  icon: IconSource;
  onPress: (uh: UserHeader) => void;
}

interface UserListItemProps {
  onPress?: () => void;
  userHeader: UserHeader;
  buttonOnPress?: (uh: UserHeader) => void;
  buttonIcon?: IconSource;
  /** Additional action buttons to display on the right side */
  additionalButtons?: ActionButton[];
  disabled?: boolean;
}

/**
 * Generic List.Item for displaying a user. Takes a UserHeader and lets you add special features like an action button
 * or something that happens when you press it.
 */
export const UserListItem = ({
  userHeader,
  onPress,
  buttonOnPress,
  buttonIcon,
  additionalButtons,
  disabled = false,
}: UserListItemProps) => {
  const {styleDefaults, commonStyles} = useStyles();
  const {preRegistrationMode} = usePreRegistration();

  const styles = StyleSheet.create({
    // This has to account for some Paper bullshit where there is a secret View added when you define
    // a Right, and it has things that we can't override.
    item: {
      ...commonStyles.paddingHorizontalSmall,
      paddingVertical: 2,
    },
    avatar: {
      ...commonStyles.justifyCenter,
      ...(disabled ? commonStyles.disabled : {}),
    },
    titleStyle: {
      ...(disabled ? commonStyles.disabled : {}),
    },
    descriptionStyle: {
      ...(disabled ? commonStyles.disabled : {}),
    },
    buttonsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  });

  const getAvatar = React.useCallback(
    () => (
      <View style={styles.avatar}>
        <UserAvatarImage userHeader={userHeader} forceIdenticon={preRegistrationMode} />
      </View>
    ),
    [userHeader, styles.avatar, preRegistrationMode],
  );

  const getActionButton = React.useCallback(() => {
    const hasMainButton = buttonOnPress && buttonIcon;
    const hasAdditionalButtons = additionalButtons && additionalButtons.length > 0;

    if (!hasMainButton && !hasAdditionalButtons) {
      return null;
    }

    return (
      <View style={styles.buttonsContainer}>
        {hasMainButton && (
          <IconButton
            mode={'outlined'}
            size={styleDefaults.avatarSizeSmall}
            icon={buttonIcon}
            onPress={() => buttonOnPress(userHeader)}
          />
        )}
        {additionalButtons?.map((button, index) => (
          <IconButton
            key={index}
            mode={'outlined'}
            size={styleDefaults.avatarSizeSmall}
            icon={button.icon}
            onPress={() => button.onPress(userHeader)}
          />
        ))}
      </View>
    );
  }, [buttonOnPress, buttonIcon, additionalButtons, userHeader, styleDefaults.avatarSizeSmall, styles.buttonsContainer]);

  return (
    <List.Item
      style={styles.item}
      title={userHeader.username}
      description={preRegistrationMode ? undefined : userHeader.displayName}
      titleStyle={styles.titleStyle}
      descriptionStyle={styles.descriptionStyle}
      onPress={onPress}
      left={getAvatar}
      right={getActionButton}
      disabled={disabled}
    />
  );
};
