import {Text} from 'react-native-paper';
import {TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import {useStyles} from '#src/Components/Context/Contexts/StyleContext.ts';
import {RelativeTimeTag} from '#src/Components/Text/Tags/RelativeTimeTag.tsx';
import {FezPostActionsMenu} from '#src/Components/Menus/Fez/FezPostActionsMenu.tsx';
import {FezData, FezPostData} from '#src/Libraries/Structs/ControllerStructs.tsx';
import {ContentText} from '#src/Components/Text/ContentText.tsx';
import Clipboard from '@react-native-clipboard/clipboard';

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

  const styles = {
    messageView: [
      // commonStyles.paddingSmall,
      commonStyles.roundedBorderLarge,
      messageOnRight ? commonStyles.primaryContainer : commonStyles.secondaryContainer,
      messageOnRight ? commonStyles.flexEnd : commonStyles.flexStart,
    ],
    messageText: [messageOnRight ? commonStyles.primaryContainer : commonStyles.secondaryContainer],
    messageTextHeader: [
      messageOnRight ? commonStyles.primaryContainer : commonStyles.secondaryContainer,
      showAuthor ? commonStyles.displayFlex : commonStyles.displayNone,
      commonStyles.bold,
    ],
    messageDateText: [],
    opacity: [commonStyles.paddingSmall, commonStyles.roundedBorderLarge],
  };

  const onLongPress = () => Clipboard.setString(fezPost.text);

  return (
    <View style={styles.messageView}>
      <TouchableOpacity style={styles.opacity} onPress={openMenu} onLongPress={onLongPress} activeOpacity={1}>
        {showAuthor && <Text style={styles.messageTextHeader}>{fezPost.author.username}</Text>}
        <FezPostActionsMenu
          visible={menuVisible}
          closeMenu={closeMenu}
          anchor={<ContentText textStyle={styles.messageText} text={fezPost.text} />}
          fezPost={fezPost}
          fez={fez}
        />
        {fezPost.timestamp && (
          <RelativeTimeTag date={new Date(fezPost.timestamp)} style={styles.messageDateText} variant={'labelSmall'} />
        )}
      </TouchableOpacity>
    </View>
  );
};
