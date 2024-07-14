import {StyleSheet, View} from 'react-native';
import {AppIcon} from '../../Icons/AppIcon.tsx';
import {AppIcons} from '../../../libraries/Enums/Icons.ts';
import {Text} from 'react-native-paper';
import React from 'react';
import {PhotostreamImageData} from '../../../libraries/Structs/ControllerStructs.tsx';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';

interface PhotostreamImageBodyViewProps {
  image: PhotostreamImageData;
}

export const PhotostreamImageBodyView = (props: PhotostreamImageBodyViewProps) => {
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    viewContainer: {
      ...commonStyles.paddingVerticalSmall,
      ...commonStyles.paddingHorizontalSmall,
    },
    rowContainer: {
      ...commonStyles.flexRow,
      ...commonStyles.alignItemsCenter,
    },
    icon: {
      ...commonStyles.marginRightSmall,
    },
  });

  return (
    <View style={styles.viewContainer}>
      <View style={styles.rowContainer}>
        <AppIcon icon={AppIcons.map} style={styles.icon} />
        <Text>{props.image.location}</Text>
      </View>
      {props.image.event && (
        <View style={styles.rowContainer}>
          <AppIcon icon={AppIcons.events} style={styles.icon} />
          <Text>{props.image.event.title}</Text>
        </View>
      )}
    </View>
  );
};
