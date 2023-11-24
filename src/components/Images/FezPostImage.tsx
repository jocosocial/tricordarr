import {AppImage} from './AppImage';
import {StyleSheet, View} from 'react-native';
import React from 'react';
import {useStyles} from '../Context/Contexts/StyleContext';

interface FezPostImageProps {
  image: string;
  messageOnRight?: boolean;
}

export const FezPostImage = ({image, messageOnRight}: FezPostImageProps) => {
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    view: {
      ...(messageOnRight ? commonStyles.flexEnd : commonStyles.flexStart),
      ...commonStyles.roundedBorderLarge,
      ...commonStyles.overflowHidden,
    },
  });

  return (
    <View style={styles.view}>
      <AppImage mode={'image'} thumbPath={`/image/thumb/${image}`} fullPath={`/image/full/${image}`} />
    </View>
  );
};
