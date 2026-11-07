import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';

import {useAppTheme} from '#src/Context/Contexts/ThemeContext';

interface ScheduleItemHighlightViewProps {
  /** Corner radius to match the card underneath. Defaults to the radius of a Paper Card. */
  borderRadius?: number;
}

// Half the width of the ship map's location highlight (BOX_BORDER_WIDTH in MapHighlightOverlay).
const HIGHLIGHT_BORDER_WIDTH = 2;

/**
 * Red border drawn over a schedule card to mark it, in the ship map location highlight's color. An overlay rather
 * than the card's own border, so it takes no space from the card's content. The parent must fit the card exactly.
 */
export const ScheduleItemHighlightView = ({borderRadius}: ScheduleItemHighlightViewProps) => {
  const {theme} = useAppTheme();

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
          borderWidth: HIGHLIGHT_BORDER_WIDTH,
          borderColor: theme.colors.twitarrNegativeButton,
        },
      }),
    [borderRadius, theme.roundness, theme.colors.twitarrNegativeButton],
  );

  return <View style={styles.highlight} pointerEvents={'none'} />;
};
