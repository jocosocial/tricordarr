import React, {useState} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {Text} from 'react-native-paper';

import {FezPostActionsMenu} from '#src/Components/Menus/Fez/FezPostActionsMenu';
import {ContentText} from '#src/Components/Text/ContentText';
import {RelativeTimeTag} from '#src/Components/Text/Tags/RelativeTimeTag';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {FezData, FezPostData} from '#src/Structs/ControllerStructs';

interface MessageViewProps {
  fezPost: FezPostData;
  messageOnRight?: boolean;
  showAuthor?: boolean;
  fez: FezData;
}

/**
 * This is a View container for a text message in the style of Android Messages or Signal.
 * It only contains the message itself.
 */
export const MessageView = ({fezPost, messageOnRight = false, showAuthor, fez}: MessageViewProps) => {
  const {commonStyles} = useStyles();
  const [menuVisible, setMenuVisible] = useState(false);
  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const styles = StyleSheet.create({
    messageView: {
      // commonStyles.paddingSmall,
      ...commonStyles.roundedBorderLarge,
      ...(messageOnRight ? commonStyles.primaryContainer : commonStyles.secondaryContainer),
      ...(messageOnRight ? commonStyles.flexEnd : commonStyles.flexStart),
      ...commonStyles.relativeTimeMinWidth,
    },
    messageText: {
      ...(messageOnRight ? commonStyles.primaryContainer : commonStyles.secondaryContainer),
    },
    messageTextHeader: {
      ...(messageOnRight ? commonStyles.primaryContainer : commonStyles.secondaryContainer),
      ...(showAuthor ? commonStyles.displayFlex : commonStyles.displayNone),
      ...commonStyles.bold,
    },
    opacity: {
      ...commonStyles.paddingSmall,
      ...commonStyles.roundedBorderLarge,
    },
  });

  /**
   * See ForumPostMessageView.tsx for the rationale for the onLongPress vs onPress.
   */
  return (
    <View style={styles.messageView}>
      <TouchableOpacity style={styles.opacity} onLongPress={openMenu} activeOpacity={1}>
        {showAuthor && <Text style={styles.messageTextHeader}>{fezPost.author.username}</Text>}
        <FezPostActionsMenu
          visible={menuVisible}
          closeMenu={closeMenu}
          anchor={<ContentText textStyle={styles.messageText} text={fezPost.text} selectable={false} />}
          fezPost={fezPost}
          fez={fez}
        />
        {fezPost.timestamp && (
          <RelativeTimeTag date={new Date(fezPost.timestamp)} style={commonStyles.variantLabelSmall} />
        )}
      </TouchableOpacity>
    </View>
  );
};
