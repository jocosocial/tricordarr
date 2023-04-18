import {Text} from 'react-native-paper';
import {StyleProp, TextStyle, View, ViewStyle} from 'react-native';
import React from 'react';
import {useStyles} from '../Context/Contexts/StyleContext';
import ReactTimeAgo from "react-time-ago";
import {RelativeTimeTag} from "../Text/RelativeTimeTag";

interface MessageViewProps {
  text: string;
  author?: string;
  postBySelf?: boolean;
  timestamp?: Date;
}

interface MessageViewStyles {
  messageView: StyleProp<ViewStyle>;
  messageText: StyleProp<TextStyle>;
  messageTextHeader: StyleProp<TextStyle>;
  messageDateText: StyleProp<TextStyle>;
}

export const MessageView = ({text, author, timestamp = undefined, postBySelf = false}: MessageViewProps) => {
  const {commonStyles} = useStyles();

  const styles: MessageViewStyles = {
    messageView: [
      commonStyles.paddingSmall,
      commonStyles.roundedBorder,
      postBySelf ? commonStyles.primaryContainer : commonStyles.secondaryContainer,
      postBySelf ? commonStyles.flexEnd : commonStyles.flexStart,
    ],
    messageText: [
      postBySelf ? commonStyles.primaryContainer : commonStyles.secondaryContainer,
    ],
    messageTextHeader: [
      postBySelf ? commonStyles.primaryContainer : commonStyles.secondaryContainer,
      postBySelf ? commonStyles.displayNone : commonStyles.displayFlex,
      commonStyles.bold,
    ],
    messageDateText: [
      // postBySelf ? commonStyles.flexEnd : commonStyles.flexStart,
    ],
  };

  return (
    <View style={styles.messageView}>
      {!!author && <Text style={styles.messageTextHeader}>{author}</Text>}
      <Text selectable={true} style={styles.messageText}>
        {text}
      </Text>
      {timestamp && <RelativeTimeTag date={timestamp} style={styles.messageDateText} variant={'labelSmall'} /> }
    </View>
  );
};
