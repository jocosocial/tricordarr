import {APIImage} from './APIImage';
import {StyleSheet, View} from 'react-native';
import React from 'react';
import {useStyles} from '../Context/Contexts/StyleContext';

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
      <APIImage
        style={styles.image}
        mode={'image'}
        thumbPath={`/image/thumb/${image}`}
        fullPath={`/image/full/${image}`}
      />
    </View>
  );
};
