import React from 'react';
import {StyleSheet, View} from 'react-native';
import Animated from 'react-native-reanimated';

import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {useHighlightAnimation} from '#src/Hooks/useHighlightAnimation';
import {ShipLabel} from '#src/Structs/ShipStructs';

interface MapHighlightOverlayProps {
  /// Rendered size of the deck image this overlay sits on top of, in points.
  width: number;
  height: number;
  labels: ShipLabel[];
}

/// Width of the port/starboard edge arrow, as a fraction of the image width.
const ARROW_WIDTH_FRACTION = 0.03;

/// Box border thickness. Also used to pad the box out from the label's raw
/// bounds by the same amount, so the border doesn't sit flush against the text.
const BOX_BORDER_WIDTH = 4;

/**
 * Absolutely-positioned sibling of the deck image: a bordered box on every
 * target label (a venue can be captioned more than once on a deck — Lido
 * Market is port and starboard — so this takes a list, not a single box),
 * plus a short bar at the image's port or starboard edge aligned to each
 * label's vertical span, mirroring Kraken's pointer arrow.
 */
export const MapHighlightOverlay = ({width, height, labels}: MapHighlightOverlayProps) => {
  const {theme} = useAppTheme();
  const {triggerPulseAnimation, pulseAnimatedStyle} = useHighlightAnimation({});

  React.useEffect(() => {
    if (labels.length > 0) {
      triggerPulseAnimation();
    }
    // Only re-trigger when the actual target changes, not on every re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [labels.map(l => `${l.x},${l.y}`).join('|')]);

  if (width === 0 || height === 0 || labels.length === 0) {
    return null;
  }

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      width,
      height,
    },
    box: {
      position: 'absolute',
      borderWidth: BOX_BORDER_WIDTH,
      borderColor: theme.colors.twitarrNegativeButton,
      borderRadius: 4,
    },
    arrow: {
      position: 'absolute',
      backgroundColor: theme.colors.twitarrNegativeButton,
      borderRadius: 2,
    },
  });

  const arrowWidth = width * ARROW_WIDTH_FRACTION;

  return (
    <View style={styles.container} pointerEvents={'none'}>
      {labels.map((label, index) => {
        const boxStyle = {
          left: label.x * width - BOX_BORDER_WIDTH,
          top: label.y * height - BOX_BORDER_WIDTH,
          width: Math.max(label.w * width, 6) + BOX_BORDER_WIDTH * 2,
          height: Math.max(label.h * height, 6) + BOX_BORDER_WIDTH * 2,
        };
        const arrowStyle = {
          top: label.y * height,
          height: Math.max(label.h * height, 6),
          ...(label.side === 'starboard' ? {right: 0} : {left: 0}),
          width: label.side === 'center' ? 0 : arrowWidth,
        };
        return (
          <React.Fragment key={index}>
            {label.side !== 'center' && <View style={[styles.arrow, arrowStyle]} />}
            <Animated.View style={[styles.box, boxStyle, pulseAnimatedStyle]} />
          </React.Fragment>
        );
      })}
    </View>
  );
};
