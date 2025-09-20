import {useFormikContext} from 'formik';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {IconButton} from 'react-native-paper';

import {Emoji} from '#src/Components/Icons/Emoji';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {CustomEmoji} from '#src/Enums/Emoji';
import {PostContentData} from '#src/Structs/ControllerStructs';

export const EmojiPickerField = () => {
  const {commonStyles} = useStyles();
  const {values, setFieldValue} = useFormikContext<PostContentData>();

  const styles = StyleSheet.create({
    outerView: {
      ...commonStyles.flexRow,
      ...commonStyles.flexWrap,
      ...commonStyles.justifyCenter,
    },
    emoji: {
      width: 30,
      height: 30,
    },
  });

  const handleEmojiPress = (emoji: string) => {
    setFieldValue('text', `${values.text}${emoji}`);
  };

  const getEmojiIcon = (emoji: keyof typeof CustomEmoji) => <Emoji style={styles.emoji} emojiName={emoji} />;

  return (
    <View style={styles.outerView}>
      {Object.keys(CustomEmoji).map((emoji, index) => {
        return (
          <IconButton
            key={index}
            onPress={() => handleEmojiPress(emoji)}
            icon={() => getEmojiIcon(emoji as keyof typeof CustomEmoji)}
          />
        );
      })}
    </View>
  );
};
