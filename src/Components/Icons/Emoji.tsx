import React from 'react';
import {Image, ImageStyle, StyleProp} from 'react-native';

import {useStyles} from '#src/Context/Contexts/StyleContext';
import {CustomEmoji} from '#src/Enums/Emoji';

interface EmojiProps {
  emojiName: keyof typeof CustomEmoji;
  style?: StyleProp<ImageStyle>;
}

export const Emoji = ({emojiName, style}: EmojiProps) => {
  const {commonStyles} = useStyles();
  return <Image source={CustomEmoji[emojiName]} style={[commonStyles.emoji, style]} />;
};
