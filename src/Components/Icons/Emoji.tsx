import FastImage, {ImageStyle as FastImageStyle} from '@d11/react-native-fast-image';
import React, {useMemo} from 'react';
import {ImageStyle, StyleProp, StyleSheet} from 'react-native';

import {useCustomEmoji} from '#src/Context/Contexts/CustomEmojiContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';

interface EmojiProps {
  emojiName: string;
  style?: StyleProp<ImageStyle>;
}

/**
 * Renders a custom emoji from the server's catalog, or nothing for a token the catalog lacks.
 *
 * Uses FastImage rather than React Native's Image so the picture comes from the same disk cache as
 * avatars and photos, which CustomEmojiProvider fills ahead of time. The emoji's name is its
 * accessibility label, since the image alone says nothing to a screen reader.
 */
export const Emoji = ({emojiName, style}: EmojiProps) => {
  const {commonStyles} = useStyles();
  const CustomEmoji = useCustomEmoji();
  const mergedStyle = useMemo(() => StyleSheet.flatten([commonStyles.emoji, style]), [commonStyles.emoji, style]);
  const emoji = CustomEmoji[emojiName];
  if (!emoji) {
    return null;
  }
  return (
    <FastImage
      source={{uri: emoji.uri}}
      style={mergedStyle as FastImageStyle}
      resizeMode={FastImage.resizeMode.contain}
      accessible={true}
      accessibilityRole={'image'}
      accessibilityLabel={emoji.name}
    />
  );
};
