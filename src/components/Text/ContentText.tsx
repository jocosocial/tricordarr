import React, {useCallback} from 'react';
import {Text} from 'react-native-paper';
import {StyleProp, StyleSheet, TextStyle} from 'react-native';
import {CustomEmoji} from '../../libraries/Enums/Emoji';
import {Emoji} from '../Icons/Emoji';
import Markdown from '@ronradtke/react-native-markdown-display';
import {useStyles} from '../Context/Contexts/StyleContext';
import {HyperlinkText} from './HyperlinkText';
import {VariantProp} from 'react-native-paper/lib/typescript/components/Typography/types';

interface ContentTextProps {
  textStyle?: StyleProp<TextStyle>;
  text: string;
  textVariant?: VariantProp<never>;
  hashtagOnPress?: (tag: string) => void;
  mentionOnPress?: (username: string) => void;
}

/**
 * Text view to render content with our various filters applied. Filters such as emoji and Markdown.
 * @TODO this may need cleaned up and refactored to be more generic with content views.
 * Right now it's just announcements.
 */
export const ContentText = ({textStyle, text, textVariant, hashtagOnPress, mentionOnPress}: ContentTextProps) => {
  const {commonStyles, styleDefaults} = useStyles();

  const renderEmojiText = useCallback(
    (
      line: string,
      hashtagOnPressFunction?: (tag: string) => void,
      mentionOnPressFunction?: (username: string) => void,
    ) => {
      const tokens = line.split(/(:[\w-]+:)|([#@]\w+)/g);
      console.log(tokens);
      return tokens.map((token, tokenIndex) => {
        if (!token) {
          return;
        }
        if (CustomEmoji[token as keyof typeof CustomEmoji]) {
          return <Emoji key={tokenIndex} emojiName={token as keyof typeof CustomEmoji} />;
        }
        if (hashtagOnPressFunction && token.startsWith('#')) {
          console.log('HASH TOKEN', token);
          return (
            <Text key={tokenIndex} style={commonStyles.linkText} onPress={() => hashtagOnPressFunction(token)}>
              {token}
            </Text>
          );
        }
        if (mentionOnPressFunction && token.startsWith('@')) {
          console.log('MENTION TOKEN', token);
          return (
            <Text key={tokenIndex} style={commonStyles.linkText} onPress={() => mentionOnPressFunction(token)}>
              {token}
            </Text>
          );
        }
        return token;
      });
    },
    [commonStyles.linkText],
  );

  const renderContentText = useCallback(
    (contentText: string) => {
      const lines = contentText.split(/\r?\n|\r|\n/g);
      return lines.map((line, lineIndex) => {
        return (
          <React.Fragment key={lineIndex}>
            {renderEmojiText(line, hashtagOnPress, mentionOnPress)}
            {lineIndex < lines.length - 1 && '\n'}
          </React.Fragment>
        );
      });
    },
    [hashtagOnPress, mentionOnPress, renderEmojiText],
  );

  // https://www.npmjs.com/package/@ronradtke/react-native-markdown-display
  const markdownStyle = StyleSheet.create({
    text: {
      ...commonStyles.onBackground,
    },
    body: {
      fontSize: styleDefaults.fontSize,
    },
  });

  const markdownIdentifier = '<Markdown>';
  if (text.startsWith(markdownIdentifier)) {
    const strippedText = text.replace(markdownIdentifier, '');
    return <Markdown style={markdownStyle}>{strippedText}</Markdown>;
  }

  return (
    <HyperlinkText>
      <Text variant={textVariant} style={textStyle}>
        {renderContentText(text)}
      </Text>
    </HyperlinkText>
  );
};
