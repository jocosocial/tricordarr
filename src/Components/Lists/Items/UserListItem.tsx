import React, {Dispatch, memo, SetStateAction, useCallback, useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {Checkbox, IconButton, List} from 'react-native-paper';
import {IconSource} from 'react-native-paper/lib/typescript/components/Icon';

import {AppIcon} from '#src/Components/Icons/AppIcon';
import {AvatarImage} from '#src/Components/Images/AvatarImage';
import {usePreRegistration} from '#src/Context/Contexts/PreRegistrationContext';
import {useSelectable} from '#src/Context/Contexts/SelectableContext';
import {useSelection} from '#src/Context/Contexts/SelectionContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {SelectionActions} from '#src/Context/Reducers/SelectionReducer';
import {AppIcons} from '#src/Enums/Icons';
import {UserHeader} from '#src/Structs/ControllerStructs';

interface UserListItemProps {
  onPress?: () => void;
  userHeader: UserHeader;
  buttonOnPress?: (uh: UserHeader) => void;
  buttonIcon?: IconSource;
  secondaryButtonOnPress?: (uh: UserHeader) => void;
  secondaryButtonIcon?: IconSource;
  disabled?: boolean;
  enableSelection?: boolean;
  setEnableSelection?: Dispatch<SetStateAction<boolean>>;
  selected?: boolean;
  /**
   * Shows a star to the left of any trailing action buttons. Resolved by the caller (from the
   * favorites query) rather than here, so a list queries once instead of once per row.
   */
  isFavorite?: boolean;
}

/**
 * Presentational user row used by relation lists, search, and participant pickers.
 * Stays swipe-free; FlashList screens wrap it via UserFlatListItem.
 * Optional trailing IconButtons: `buttonIcon` is the primary (rightmost) action;
 * `secondaryButtonIcon` sits to its left when both are set.
 */
const UserListItemInternal = ({
  userHeader,
  onPress,
  buttonOnPress,
  buttonIcon,
  secondaryButtonOnPress,
  secondaryButtonIcon,
  disabled = false,
  enableSelection = false,
  setEnableSelection,
  selected = false,
  isFavorite = false,
}: UserListItemProps) => {
  const {styleDefaults, commonStyles} = useStyles();
  const {preRegistrationMode} = usePreRegistration();
  const {theme} = useAppTheme();
  const {dispatchSelectedItems} = useSelection();
  const {fromUserHeader} = useSelectable();

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
        actions: {
          ...commonStyles.flexRow,
          ...commonStyles.alignItemsCenter,
        },
        favoriteIcon: {
          ...commonStyles.flexColumn,
          ...commonStyles.justifyCenter,
        },
      }),
    [commonStyles, disabled, theme],
  );

  const handleSelection = () => {
    dispatchSelectedItems({
      type: SelectionActions.select,
      item: fromUserHeader(userHeader),
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

  /**
   * Renders the trailing IconButton(s). A lone button is returned as-is so existing
   * single-action rows keep the same layout; two buttons sit in a horizontal row.
   */
  const getActionButton = useCallback(() => {
    const primary =
      buttonOnPress && buttonIcon ? (
        <IconButton
          mode={'outlined'}
          size={styleDefaults.avatarSizeSmall}
          icon={buttonIcon}
          onPress={() => buttonOnPress(userHeader)}
        />
      ) : undefined;
    const secondary =
      secondaryButtonOnPress && secondaryButtonIcon ? (
        <IconButton
          mode={'outlined'}
          size={styleDefaults.avatarSizeSmall}
          icon={secondaryButtonIcon}
          onPress={() => secondaryButtonOnPress(userHeader)}
        />
      ) : undefined;
    if (!primary && !secondary) {
      return undefined;
    }
    if (primary && secondary) {
      return (
        <View style={styles.actions}>
          {secondary}
          {primary}
        </View>
      );
    }
    return primary ?? secondary;
  }, [
    buttonOnPress,
    buttonIcon,
    secondaryButtonOnPress,
    secondaryButtonIcon,
    userHeader,
    styleDefaults.avatarSizeSmall,
    styles.actions,
  ]);

  /**
   * Prefixes the trailing action buttons with the favorite star. Rows without a star are
   * returned untouched so existing single-action layouts are unchanged.
   */
  const getRight = useCallback(() => {
    const actionButton = getActionButton();
    if (!isFavorite) {
      return actionButton;
    }
    const star = (
      <View style={styles.favoriteIcon}>
        <AppIcon icon={AppIcons.favorite} color={theme.colors.twitarrYellow} />
      </View>
    );
    if (!actionButton) {
      return star;
    }
    return (
      <View style={styles.actions}>
        {star}
        {actionButton}
      </View>
    );
  }, [getActionButton, isFavorite, styles.favoriteIcon, styles.actions, theme]);

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
      right={enableSelection ? undefined : getRight}
      disabled={disabled}
      onLongPress={setEnableSelection ? onLongPress : undefined}
    />
  );
};

export const UserListItem = memo(UserListItemInternal);
