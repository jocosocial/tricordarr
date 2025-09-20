import {CustomEmoji} from '#src/Enums/Emoji';
import {Image, ImageStyle, StyleProp} from 'react-native';
import React from 'react';
import {useStyles} from '#src/Context/Contexts/StyleContext';

interface EmojiProps {
  emojiName: keyof typeof CustomEmoji;
  style?: StyleProp<ImageStyle>;
}

export const Emoji = ({emojiName, style}: EmojiProps) => {
  const {commonStyles} = useStyles();
  return <Image source={CustomEmoji[emojiName]} style={[commonStyles.emoji, style]} />;
};
