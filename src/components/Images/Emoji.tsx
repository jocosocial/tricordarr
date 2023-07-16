import {CustomEmoji} from '../../libraries/Enums/Emoji';
import {Image} from 'react-native';
import React from 'react';
import {useStyles} from '../Context/Contexts/StyleContext';

interface EmojiProps {
  emojiName: keyof typeof CustomEmoji;
}

export const Emoji = ({emojiName}: EmojiProps) => {
  const {commonStyles} = useStyles();
  return <Image source={CustomEmoji[emojiName]} style={[commonStyles.emoji]} />;
};
