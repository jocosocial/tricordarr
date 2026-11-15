import React, {useMemo} from 'react';
import {Image, ImageStyle, StyleProp, StyleSheet} from 'react-native';

import {useCustomEmoji} from '#src/Context/Contexts/CustomEmojiContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';

interface EmojiProps {
  emojiName: string;
  style?: StyleProp<ImageStyle>;
}

/** Renders a custom emoji from the catalog: its bundled image, or the server's for newer emoji. */
export const Emoji = ({emojiName, style}: EmojiProps) => {
  const {commonStyles} = useStyles();
  const CustomEmoji = useCustomEmoji();
  const mergedStyle = useMemo(() => StyleSheet.flatten([commonStyles.emoji, style]), [commonStyles.emoji, style]);
  const emoji = CustomEmoji[emojiName];
  return emoji ? <Image source={emoji.source} style={mergedStyle} /> : null;
};
