import React from 'react';
import {IconButton} from 'react-native-paper';
import {AppIcons} from '#src/Libraries/Enums/Icons.ts';
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {useStyles} from '#src/Components/Context/Contexts/StyleContext.ts';

interface ImageButtonsProps {
  style?: StyleProp<ViewStyle>;
  disableAttach?: boolean;
  disableTake?: boolean;
  disableDelete?: boolean;
  pickImage: () => void;
  takeImage: () => void;
  clearImage: () => void;
}

/**
 * Buttons to manage taking/uploading/deleting an image. This is not intended for "Content" post purposes
 * such as Forums or LFGs. More useful for Photo Stream or User Profile.
 * @constructor
 */
export const ImageButtons = (props: ImageButtonsProps) => {
  const {commonStyles} = useStyles();

  // https://stackoverflow.com/questions/51189388/typescript-spread-types-may-only-be-created-from-object-types
  const styles = StyleSheet.create({
    outerView: {
      ...commonStyles.flexRow,
      ...(props.style as object),
    },
  });

  return (
    <View style={styles.outerView}>
      <IconButton icon={AppIcons.newImage} onPress={props.pickImage} disabled={props.disableAttach} />
      <IconButton icon={AppIcons.newImageCamera} onPress={props.takeImage} disabled={props.disableTake} />
      <IconButton icon={AppIcons.delete} onPress={props.clearImage} disabled={props.disableDelete} />
    </View>
  );
};
