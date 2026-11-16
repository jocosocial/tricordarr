import React, {useMemo} from 'react';
import {StyleSheet} from 'react-native';
import {Text} from 'react-native-paper';

import {Emoji} from '#src/Components/Icons/Emoji';
import {useCustomEmoji} from '#src/Context/Contexts/CustomEmojiContext';

interface ReactionIconProps {
  reaction: string;
  size?: number;
}

/** Renders either a Unicode reaction or one of Tricordarr's custom emoji images. */
export const ReactionIcon = ({reaction, size = 20}: ReactionIconProps) => {
  const CustomEmoji = useCustomEmoji();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        customEmoji: {
          width: size,
          height: size,
        },
        unicodeEmoji: {
          fontSize: size,
          lineHeight: size + 4,
        },
      }),
    [size],
  );

  // Own keys only: a reaction is arbitrary text from the server, and `in` also matches inherited
  // keys such as `constructor`.
  if (Object.hasOwn(CustomEmoji, reaction)) {
    return <Emoji emojiName={reaction as string} style={styles.customEmoji} />;
  }
  return <Text style={styles.unicodeEmoji}>{reaction}</Text>;
};
