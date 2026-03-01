import React, {Dispatch, SetStateAction} from 'react';
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

export const UserListItem = ({
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

  const styles = StyleSheet.create({
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
  });

  const handleSelection = () => {
    dispatchSelectedItems({
      type: SelectionActions.select,
      item: Selectable.fromUserHeader(userHeader),
    });
  };

  const getAvatar = React.useCallback(
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
