import {Text} from 'react-native-paper';
import {TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import {useStyles} from '../Context/Contexts/StyleContext';
import {RelativeTimeTag} from '../Text/Tags/RelativeTimeTag';
import {FezPostActionsMenu} from '../Menus/FezPostActionsMenu';
import {FezPostData} from '../../libraries/Structs/ControllerStructs';
import {ContentText} from '../Text/ContentText';

interface MessageViewProps {
  fezPost: FezPostData;
  messageOnRight?: boolean;
  showAuthor?: boolean;
}

/**
 * This is a View container for a text message in the style of Android Messages or Signal.
 * It only contains the message itself.
 */
export const MessageView = ({fezPost, messageOnRight = false, showAuthor}: MessageViewProps) => {
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

  return (
    <View style={styles.messageView}>
      <TouchableOpacity style={styles.opacity} onLongPress={openMenu}>
        {showAuthor && <Text style={styles.messageTextHeader}>{fezPost.author.username}</Text>}
        <FezPostActionsMenu
          visible={menuVisible}
          closeMenu={closeMenu}
          anchor={<ContentText textStyle={styles.messageText} text={fezPost.text} />}
          fezPost={fezPost}
        />
        {fezPost.timestamp && (
          <RelativeTimeTag date={new Date(fezPost.timestamp)} style={styles.messageDateText} variant={'labelSmall'} />
        )}
      </TouchableOpacity>
    </View>
  );
};
