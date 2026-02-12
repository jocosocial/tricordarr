import React from 'react';
import {ColorValue, StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {Text} from 'react-native-paper';

import {useStyles} from '#src/Context/Contexts/StyleContext';

interface EventBannerViewProps {
  label: string;
  color: ColorValue;
  backgroundColor: ColorValue;
  style?: StyleProp<ViewStyle>;
}

export const EventCardMarkerView = ({label, color, backgroundColor, style}: EventBannerViewProps) => {
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    markerView: {
      ...commonStyles.flexRow,
      ...commonStyles.roundedBorderCardLeft,
      ...commonStyles.heightFull,
      ...commonStyles.cardBannerWidth,
      backgroundColor: backgroundColor,
    },
    markerContainer: {
      ...commonStyles.justifyCenter,
    },
    markerText: {
      transform: [{rotate: '90deg'}],
      color: color,
      ...commonStyles.paddingVertical,
      ...commonStyles.cardBannerWidth,
      ...commonStyles.bold,
    },
  });

  return (
    <View style={[styles.markerView, style]}>
      <View style={styles.markerContainer}>
        <Text style={styles.markerText}>{label}</Text>
      </View>
    </View>
  );
};
