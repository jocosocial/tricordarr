import {StyleSheet, View} from 'react-native';
import {useStyles} from '#src/Components/Context/Contexts/StyleContext';
import React from 'react';
import {AppIcons} from '#src/Libraries/Enums/Icons';
import {AppIcon} from '#src/Components/Icons/AppIcon';
import {BoldText} from '#src/Components/Text/BoldText';

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
