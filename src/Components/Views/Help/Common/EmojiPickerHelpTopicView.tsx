import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {Emoji} from '#src/Components/Icons/Emoji';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {HelpTopicView} from '#src/Components/Views/Help/HelpTopicView';
import {useCustomEmoji} from '#src/Context/Contexts/CustomEmojiContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';

export const EmojiPickerHelpTopicView = () => {
  const {commonStyles} = useStyles();
  const CustomEmoji = useCustomEmoji();

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

  const emojiList = Object.keys(CustomEmoji).filter(emoji => !CustomEmoji[emoji as string].secret) as Array<string>;

  return (
    <>
      <HelpTopicView title={'Custom Emoji'}>Insert custom emoji into your post.</HelpTopicView>
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
