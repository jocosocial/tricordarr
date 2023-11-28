import {Text} from 'react-native-paper';
import {TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import {useStyles} from '../Context/Contexts/StyleContext';
import {RelativeTimeTag} from '../Text/RelativeTimeTag';
import {FezPostActionsMenu} from '../Menus/FezPostActionsMenu';
import {FezPostData, PostData} from '../../libraries/Structs/ControllerStructs';
import {ContentText} from '../Text/ContentText';

interface ForumPostMessageViewProps {
  postData: PostData;
  messageOnRight?: boolean;
  showAuthor?: boolean;
}

/**
 * This is a View container for a text message in the style of Android Messages or Signal.
 * It only contains the message itself.
 * Maybe dedupe with MessageView?
 */
export const ForumPostMessageView = ({postData, messageOnRight = false, showAuthor}: ForumPostMessageViewProps) => {
  const {commonStyles} = useStyles();
  const [menuVisible, setMenuVisible] = useState(false);
  const openMenu = () => setMenuVisible(true);
  // const closeMenu = () => setMenuVisible(false);
  // const toggleRawTime = () => setRawTime(!rawTime);

  const styles = {
    messageView: [
      // commonStyles.paddingSmall,
      commonStyles.roundedBorderLarge,
      messageOnRight ? commonStyles.primaryContainer : commonStyles.secondaryContainer,
      messageOnRight ? commonStyles.flexEnd : commonStyles.flexStart,
      commonStyles.fullWidth,
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
      <TouchableOpacity style={styles.opacity} onPress={openMenu}>
        {showAuthor && <Text style={styles.messageTextHeader}>{postData.author.username}</Text>}
        {/*<FezPostActionsMenu*/}
        {/*  visible={menuVisible}*/}
        {/*  closeMenu={closeMenu}*/}
        {/*  anchor={<ContentText textStyle={styles.messageText} text={fezPost.text} />}*/}
        {/*  fezPost={fezPost}*/}
        {/*/>*/}
        <ContentText textStyle={styles.messageText} text={postData.text} />
        {postData.createdAt && (
          <RelativeTimeTag date={new Date(postData.createdAt)} style={styles.messageDateText} variant={'labelSmall'} />
        )}
      </TouchableOpacity>
    </View>
  );
};