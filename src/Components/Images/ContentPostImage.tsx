import React from 'react';
import {StyleSheet, View} from 'react-native';

import {APIImageV2} from '#src/Components/Images/APIImageV2';
import {useStyles} from '#src/Context/Contexts/StyleContext';

interface FezPostImageProps {
  image: string;
  messageOnRight?: boolean;
}

export const ContentPostImage = ({image, messageOnRight}: FezPostImageProps) => {
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    view: {
      ...commonStyles.fullWidth,
      ...(messageOnRight ? commonStyles.flexEnd : commonStyles.flexStart),
      ...commonStyles.roundedBorderLarge,
      ...commonStyles.overflowHidden,
    },
    image: {
      ...commonStyles.fullWidth,
    },
  });

  return (
    <View style={styles.view}>
      <APIImageV2 path={image} style={styles.image} mode={'scaledimage'} />
    </View>
  );
};
