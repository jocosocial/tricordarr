import React, {useMemo} from 'react';
import {Image, ImageStyle, StyleProp, StyleSheet} from 'react-native';

import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useCustomEmoji} from '#src/Hooks/useCustomEmoji';

interface EmojiProps {
  emojiName: string;
  style?: StyleProp<ImageStyle>;
}

/** Renders a custom emoji using the server catalog image URL. */
export const Emoji = ({emojiName, style}: EmojiProps) => {
  const {commonStyles} = useStyles();
  const CustomEmoji = useCustomEmoji();
  const mergedStyle = useMemo(() => StyleSheet.flatten([commonStyles.emoji, style]), [commonStyles.emoji, style]);
  const emoji = CustomEmoji[emojiName];
  return emoji ? <Image source={emoji.source} style={mergedStyle} /> : null;
};
