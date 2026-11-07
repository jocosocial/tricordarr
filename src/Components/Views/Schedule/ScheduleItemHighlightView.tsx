import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';

import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';

interface ScheduleItemHighlightViewProps {
  /** Corner radius to match the card underneath. Defaults to the radius of a Paper Card. */
  borderRadius?: number;
}

/**
 * Red border drawn over a schedule card to mark it, in the ship map location highlight's color. An overlay rather
 * than the card's own border, so it takes no space from the card's content. The parent must fit the card exactly.
 */
export const ScheduleItemHighlightView = ({borderRadius}: ScheduleItemHighlightViewProps) => {
  const {theme} = useAppTheme();
  const {styleDefaults} = useStyles();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        highlight: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: borderRadius ?? theme.roundness * 3,
          borderWidth: styleDefaults.highlightBorderWidth,
          borderColor: theme.colors.twitarrNegativeButton,
        },
      }),
    [borderRadius, styleDefaults.highlightBorderWidth, theme.roundness, theme.colors.twitarrNegativeButton],
  );

  return <View style={styles.highlight} pointerEvents={'none'} />;
};
