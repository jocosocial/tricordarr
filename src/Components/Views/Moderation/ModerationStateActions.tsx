import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, Menu, Text} from 'react-native-paper';

import {useStyles} from '#src/Context/Contexts/StyleContext';
import {ContentModerationStatus} from '#src/Enums/ContentModerationStatus';
import {useMenu} from '#src/Hooks/useMenu';

interface ModerationStateActionsProps {
  status: ContentModerationStatus;
  disabled?: boolean;
  isLoading?: boolean;
  onSelect: (status: ContentModerationStatus) => void;
}

/**
 * Set State control matching Swiftarr's moderation dropdown, plus the current status.
 */
export const ModerationStateActions = ({status, disabled, isLoading, onSelect}: ModerationStateActionsProps) => {
  const {visible, openMenu, closeMenu} = useMenu();
  const {commonStyles} = useStyles();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          ...commonStyles.flexRow,
          ...commonStyles.flexWrap,
          ...commonStyles.alignItemsCenter,
          ...commonStyles.gapSmall,
        },
      }),
    [commonStyles],
  );

  return (
    <View style={styles.row}>
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={
          <Button mode={'contained'} compact={true} disabled={disabled || isLoading} onPress={openMenu}>
            Set State
          </Button>
        }>
        {ContentModerationStatus.settableStates.map(state => (
          <Menu.Item
            key={state}
            dense={false}
            title={ContentModerationStatus.getActionLabel(state)}
            disabled={state === status}
            onPress={() => {
              closeMenu();
              onSelect(state);
            }}
          />
        ))}
      </Menu>
      <Text>Current State: {ContentModerationStatus.getLabel(status)}</Text>
    </View>
  );
};
