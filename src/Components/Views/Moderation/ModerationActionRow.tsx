import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {Button} from 'react-native-paper';

import {useStyles} from '#src/Context/Contexts/StyleContext';

interface ModerationActionButton {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  mode?: 'text' | 'outlined' | 'contained' | 'elevated' | 'contained-tonal';
}

interface ModerationActionRowProps {
  buttons: ModerationActionButton[];
}

/**
 * Wrap-friendly row of compact action buttons used on moderation screens.
 */
export const ModerationActionRow = ({buttons}: ModerationActionRowProps) => {
  const {commonStyles} = useStyles();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          ...commonStyles.flexRow,
          ...commonStyles.flexWrap,
          ...commonStyles.gapSmall,
        },
      }),
    [commonStyles],
  );

  return (
    <View style={styles.row}>
      {buttons.map(button => (
        <Button
          key={button.label}
          mode={button.mode ?? 'outlined'}
          compact={true}
          disabled={button.disabled}
          onPress={button.onPress}>
          {button.label}
        </Button>
      ))}
    </View>
  );
};
