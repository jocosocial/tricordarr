import FastImage, {ImageStyle as FastImageStyle} from '@d11/react-native-fast-image';
import React, {useMemo} from 'react';
import {ImageStyle, StyleProp, StyleSheet} from 'react-native';

import {useCustomEmoji} from '#src/Context/Contexts/CustomEmojiContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {inlineEmojiStyle} from '#src/Libraries/Reactions/InlineEmojiStyle';

interface EmojiProps {
  emojiName: string;
  style?: StyleProp<ImageStyle>;
  /**
   * For an emoji inside a line of text: that text's font size as displayed, system font scaling
   * included. The emoji then takes its size and vertical position from the text. See inlineEmojiStyle.
   */
  textFontSize?: number;
}

/**
 * Renders a custom emoji from the server's catalog, or nothing for a token the catalog lacks.
 *
 * Uses FastImage rather than React Native's Image so the picture comes from the same disk cache as
 * avatars and photos, which CustomEmojiProvider fills ahead of time. The emoji's name is its
 * accessibility label, since the image alone says nothing to a screen reader.
 */
export const Emoji = ({emojiName, style, textFontSize}: EmojiProps) => {
  const {commonStyles} = useStyles();
  const CustomEmoji = useCustomEmoji();
  const mergedStyle = useMemo(
    () =>
      StyleSheet.flatten([
        commonStyles.emoji,
        textFontSize !== undefined ? inlineEmojiStyle(textFontSize) : undefined,
        style,
      ]),
    [commonStyles.emoji, style, textFontSize],
  );
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
