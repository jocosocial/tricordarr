import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {Emoji} from '#src/Components/Icons/Emoji';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {CustomEmoji} from '#src/Enums/Emoji';

export const EmojiPickerHelpTopicView = () => {
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    emojiContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'flex-start',
    },
    emojiRow: {
      ...commonStyles.flexRow,
      ...commonStyles.marginBottomSmall,
      ...commonStyles.alignItemsCenter,
      width: '48%',
      marginHorizontal: '1%',
    },
    emojiIconContainer: {
      ...commonStyles.marginRightSmall,
    },
    emojiText: {
      ...commonStyles.emoji,
    },
    emojiNameText: {
      ...commonStyles.onBackground,
    },
  });

  const emojiList = Object.keys(CustomEmoji).filter(
    emoji => !CustomEmoji[emoji as keyof typeof CustomEmoji].secret,
  ) as Array<keyof typeof CustomEmoji>;

  return (
    <>
      <HelpTopicView title={'Custom Emoji'}>
        Insert custom emoji into your post. Tap any emoji to add it at the current cursor position in your text.
        {'\n\n'}
        Available emoji:
      </HelpTopicView>
      <PaddedContentView>
        <View style={styles.emojiContainer}>
          {emojiList.map(emojiName => (
            <View key={emojiName} style={styles.emojiRow}>
              <View style={styles.emojiIconContainer}>
                <Emoji emojiName={emojiName} style={styles.emojiText} />
              </View>
              <Text selectable={true} style={styles.emojiNameText}>
                {emojiName}
              </Text>
            </View>
          ))}
        </View>
      </PaddedContentView>
    </>
  );
};
