import {Menu, Text} from 'react-native-paper';
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

interface MessageViewProps {
  text: string;
  author?: string;
  postBySelf?: boolean;
  timestamp?: Date;
}

/**
 * This is a View container for a text message in the style of Android Messages or Signal.
 * It only contains the message itself.
 */
export const MessageView = ({text, author, timestamp = undefined, postBySelf = false}: MessageViewProps) => {
  const {commonStyles} = useStyles();
  const messageRef = useRef<View>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

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
        {!!author && <Text style={styles.messageTextHeader}>{author}</Text>}
        <FezPostActionsMenu
          visible={menuVisible}
          closeMenu={closeMenu}
          anchor={<Text style={styles.messageText}>{text}</Text>}>
          <Menu.Item
            dense={true}
            leadingIcon={AppIcons.copy}
            title={'Copy'}
            onPress={() => {
              Clipboard.setString(text);
              closeMenu();
            }}
          />
        </FezPostActionsMenu>
        {timestamp && <RelativeTimeTag date={timestamp} style={styles.messageDateText} variant={'labelSmall'} />}
      </TouchableOpacity>
    </View>
  );
};
