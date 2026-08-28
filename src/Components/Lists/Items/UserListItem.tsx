import React, {Dispatch, memo, SetStateAction, useCallback, useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {Checkbox, IconButton, List} from 'react-native-paper';
import {IconSource} from 'react-native-paper/lib/typescript/components/Icon';

import {AvatarImage} from '#src/Components/Images/AvatarImage';
import {usePreRegistration} from '#src/Context/Contexts/PreRegistrationContext';
import {useSelection} from '#src/Context/Contexts/SelectionContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {SelectionActions} from '#src/Context/Reducers/SelectionReducer';
import {UserHeader} from '#src/Structs/ControllerStructs';
import {Selectable} from '#src/Types/Selectable';

interface UserListItemProps {
  onPress?: () => void;
  userHeader: UserHeader;
  buttonOnPress?: (uh: UserHeader) => void;
  buttonIcon?: IconSource;
  disabled?: boolean;
  enableSelection?: boolean;
  setEnableSelection?: Dispatch<SetStateAction<boolean>>;
  selected?: boolean;
}

/**
 * Presentational user row used by relation lists, search, and participant pickers.
 * Stays swipe-free; FlashList screens wrap it via UserFlatListItem.
 */
const UserListItemInternal = ({
  userHeader,
  onPress,
  buttonOnPress,
  buttonIcon,
  disabled = false,
  enableSelection = false,
  setEnableSelection,
  selected = false,
}: UserListItemProps) => {
  const {styleDefaults, commonStyles} = useStyles();
  const {preRegistrationMode} = usePreRegistration();
  const {theme} = useAppTheme();
  const {dispatchSelectedItems} = useSelection();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        item: {
          ...commonStyles.paddingHorizontalSmall,
          paddingVertical: 2,
          backgroundColor: theme.colors.background,
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
        checkboxContainer: {
          ...commonStyles.flexColumn,
          ...commonStyles.justifyCenter,
        },
      }),
    [commonStyles, disabled, theme],
  );

  const handleSelection = () => {
    dispatchSelectedItems({
      type: SelectionActions.select,
      item: Selectable.fromUserHeader(userHeader),
    });
  };

  const getAvatar = useCallback(
    () => (
      <View style={styles.avatar}>
        <AvatarImage userHeader={userHeader} forceIdenticon={preRegistrationMode} />
      </View>
    ),
    [userHeader, styles.avatar, preRegistrationMode],
  );

  const getCheckbox = () => (
    <View style={styles.checkboxContainer}>
      <Checkbox status={selected ? 'checked' : 'unchecked'} onPress={handleSelection} />
    </View>
  );

  const getActionButton = useCallback(() => {
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

  const onLongPress = () => {
    if (setEnableSelection) {
      setEnableSelection(true);
      handleSelection();
    }
  };

  return (
    <List.Item
      style={styles.item}
      title={userHeader.username}
      description={preRegistrationMode ? undefined : userHeader.displayName}
      titleStyle={styles.titleStyle}
      descriptionStyle={styles.descriptionStyle}
      onPress={enableSelection ? handleSelection : onPress}
      left={enableSelection ? getCheckbox : getAvatar}
      right={enableSelection ? undefined : getActionButton}
      disabled={disabled}
      onLongPress={setEnableSelection ? onLongPress : undefined}
    />
  );
};

export const UserListItem = memo(UserListItemInternal);
