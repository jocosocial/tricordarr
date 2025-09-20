import {StyleSheet, View} from 'react-native';
import {useStyles} from '../Context/Contexts/StyleContext';
import React from 'react';
import {AppIcons} from '../../Libraries/Enums/Icons';
import {AppIcon} from '../Icons/AppIcon';
import {BoldText} from '../Text/BoldText';

interface MapIndicatorViewProps {
  direction: 'Forward' | 'Aft';
}

export const MapIndicatorView = ({direction}: MapIndicatorViewProps) => {
  const {commonStyles, styleDefaults} = useStyles();

  const styles = StyleSheet.create({
    headerView: {
      ...commonStyles.flexRow,
      ...commonStyles.marginVerticalSmall,
    },
    headerTextContainer: {
      ...commonStyles.flexGrow,
      ...commonStyles.justifyCenter,
      ...commonStyles.alignItemsCenter,
    },
    sideTextContainer: {
      ...commonStyles.flexRow,
      width: styleDefaults.marginSize * 6,
      ...commonStyles.alignItemsCenter,
    },
    leftTextContainer: {
      justifyContent: 'flex-start',
    },
    rightTextContainer: {
      justifyContent: 'flex-end',
    },
  });

  return (
    <View style={styles.headerView}>
      <View style={[styles.sideTextContainer, styles.leftTextContainer]}>
        <AppIcon icon={AppIcons.circle} color={'red'} />
        <BoldText>Port</BoldText>
      </View>
      <View style={styles.headerTextContainer}>
        <BoldText>{direction}</BoldText>
      </View>
      <View style={[styles.sideTextContainer, styles.rightTextContainer]}>
        <BoldText>Starboard</BoldText>
        <AppIcon icon={AppIcons.circle} color={'green'} />
      </View>
    </View>
  );
};
