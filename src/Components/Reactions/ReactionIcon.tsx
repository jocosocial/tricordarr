import React, {useMemo} from 'react';
import {StyleSheet} from 'react-native';
import {Text} from 'react-native-paper';

import {Emoji} from '#src/Components/Icons/Emoji';
import {CustomEmoji} from '#src/Enums/Emoji';

interface ReactionIconProps {
  reaction: string;
  size?: number;
}

/** Renders either a Unicode reaction or one of Tricordarr's custom emoji images. */
export const ReactionIcon = ({reaction, size = 20}: ReactionIconProps) => {
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

  if (reaction in CustomEmoji) {
    return <Emoji emojiName={reaction as keyof typeof CustomEmoji} style={styles.customEmoji} />;
  }
  return <Text style={styles.unicodeEmoji}>{reaction}</Text>;
};
