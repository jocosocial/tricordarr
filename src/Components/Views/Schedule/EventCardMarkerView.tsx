import React from 'react';
import {ColorValue, StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {Text} from 'react-native-paper';

import {useStyles} from '#src/Context/Contexts/StyleContext';
import {styleDefaults} from '#src/Styles';

interface EventBannerViewProps {
  label: string;
  color: ColorValue;
  backgroundColor: ColorValue;
  style?: StyleProp<ViewStyle>;
}

/**
 * "Now" / "Soon" banner on schedule cards.
 *
 * Rotation was previously on Text; on some
 * devices the first paint happened before layout, so the transform rendered wrong.
 * Fix: minHeight so the container is never zero on first paint, and apply rotation
 * to a wrapper View (with explicit dimensions) instead of the Text.
 */
export const EventCardMarkerView = ({label, color, backgroundColor, style}: EventBannerViewProps) => {
  const {commonStyles} = useStyles();

  const bannerWidth = styleDefaults.marginSize * 2;
  const styles = StyleSheet.create({
    markerView: {
      ...commonStyles.flexRow,
      ...commonStyles.roundedBorderCardLeft,
      ...commonStyles.heightFull,
      ...commonStyles.cardBannerWidth,
      minHeight: bannerWidth, // Avoid zero height on first paint (parent may not have laid out yet).
      backgroundColor: backgroundColor,
    },
    markerContainer: {
      ...commonStyles.justifyCenter,
    },
    rotatedWrapper: {
      // Rotate the View, not the Text—more reliable when layout is async.
      transform: [{rotate: '90deg'}],
      width: bannerWidth,
      minHeight: bannerWidth,
    },
    markerText: {
      color: color,
      ...commonStyles.paddingVertical,
      ...commonStyles.cardBannerWidth,
      ...commonStyles.bold,
    },
  });

  return (
    <View style={[styles.markerView, style]}>
      <View style={styles.markerContainer}>
        <View style={styles.rotatedWrapper}>
          <Text style={styles.markerText}>{label}</Text>
        </View>
      </View>
    </View>
  );
};
