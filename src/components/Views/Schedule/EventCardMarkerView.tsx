import React from 'react';
import {Text} from 'react-native-paper';
import {useStyles} from '#src/Components/Context/Contexts/StyleContext';
import {ColorValue, StyleSheet, View} from 'react-native';

interface EventBannerViewProps {
  label: string;
  color: ColorValue;
  backgroundColor: ColorValue;
}

export const EventCardMarkerView = ({label, color, backgroundColor}: EventBannerViewProps) => {
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
    <View style={styles.markerView}>
      <View style={styles.markerContainer}>
        <Text style={styles.markerText}>{label}</Text>
      </View>
    </View>
  );
};
