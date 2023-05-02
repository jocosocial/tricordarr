import {Menu, Text, Tooltip} from 'react-native-paper';
import {
  GestureResponderEvent,
  NativeUIEvent,
  StyleProp,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import React, {useRef, useState} from 'react';
import {useStyles} from '../Context/Contexts/StyleContext';
import ReactTimeAgo from 'react-time-ago';
import {RelativeTimeTag} from '../Text/RelativeTimeTag';
import {FezPostActionsMenu} from '../Menus/FezPostActionsMenu';
import {AppIcons} from '../../libraries/Enums/Icons';
import Clipboard from '@react-native-clipboard/clipboard';
import {FezPostData} from '../../libraries/Structs/ControllerStructs';

interface MessageViewProps {
  fezPost: FezPostData;
  postBySelf?: boolean;
  showAuthor?: boolean;
}

/**
 * This is a View container for a text message in the style of Android Messages or Signal.
 * It only contains the message itself.
 */
export const MessageView = ({fezPost, postBySelf = false, showAuthor}: MessageViewProps) => {
  const {commonStyles} = useStyles();
  const [menuVisible, setMenuVisible] = useState(false);
  const [rawTime, setRawTime] = useState(false);
  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);
  const toggleRawTime = () => setRawTime(!rawTime);

  const styles = {
    messageView: [
      // commonStyles.paddingSmall,
      commonStyles.roundedBorderLarge,
      postBySelf ? commonStyles.primaryContainer : commonStyles.secondaryContainer,
      postBySelf ? commonStyles.flexEnd : commonStyles.flexStart,
    ],
    messageText: [postBySelf ? commonStyles.primaryContainer : commonStyles.secondaryContainer],
    messageTextHeader: [
      postBySelf ? commonStyles.primaryContainer : commonStyles.secondaryContainer,
      postBySelf ? commonStyles.displayNone : commonStyles.displayFlex,
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
          anchor={<Text style={styles.messageText}>{fezPost.text}</Text>}
          fezPost={fezPost}
        />
        {fezPost.timestamp && (
          <RelativeTimeTag date={fezPost.timestamp} style={styles.messageDateText} variant={'labelSmall'} raw={rawTime} />
        )}
      </TouchableOpacity>
    </View>
  );
};
