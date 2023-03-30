import {Text} from 'react-native-paper';
import {TextStyle, View, ViewStyle} from 'react-native';
import React from 'react';
import {useStyles} from '../Context/Contexts/StyleContext';

interface MessageViewProps {
  text: string;
  author?: string;
  postBySelf?: boolean;
}

interface MessageViewStyles {
  messageView: ViewStyle[];
  messageText: TextStyle[];
  messageTextHeader: TextStyle[];
}

export const MessageView = ({text, author, postBySelf = false}: MessageViewProps) => {
  const {commonStyles} = useStyles();

  const styles: MessageViewStyles = {
    messageView: [
      commonStyles.paddingSmall,
      commonStyles.roundedBorder,
      postBySelf ? commonStyles.primaryContainer : commonStyles.secondaryContainer,
      postBySelf ? commonStyles.flexEnd : commonStyles.flexStart,
    ],
    messageText: [postBySelf ? commonStyles.primaryContainer : commonStyles.secondaryContainer],
    messageTextHeader: [
      postBySelf ? commonStyles.primaryContainer : commonStyles.secondaryContainer,
      postBySelf ? commonStyles.displayNone : commonStyles.displayFlex,
      commonStyles.bold,
    ],
  };

  return (
    <View style={styles.messageView}>
      {!!author && <Text style={styles.messageTextHeader}>{author}</Text>}
      <Text selectable={true} style={styles.messageText}>
        {text}
      </Text>
    </View>
  );
};
