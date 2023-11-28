import React from 'react';
import {Text} from 'react-native-paper';
import {StyleProp, StyleSheet, TextStyle} from 'react-native';
import {CustomEmoji} from '../../libraries/Enums/Emoji';
import {Emoji} from '../Images/Emoji';
import Markdown from '@ronradtke/react-native-markdown-display';
import {useStyles} from '../Context/Contexts/StyleContext';
import {HyperlinkText} from './HyperlinkText';
import {VariantProp} from 'react-native-paper/lib/typescript/components/Typography/types';

interface ContentTextProps {
  textStyle?: StyleProp<TextStyle>;
  text: string;
  textVariant?: VariantProp<never>;
}

/**
 * Text view to render content with our various filters applied. Filters such as emoji and Markdown.
 * @TODO this may need cleaned up and refactored to be more generic with content views.
 * Right now it's just announcements.
 */
export const ContentText = ({textStyle, text, textVariant}: ContentTextProps) => {
  const {commonStyles, styleDefaults} = useStyles();

  const renderEmojiText = (line: string) => {
    const tokens = line.split(/(:[\w-]+:)/g);
    return tokens.map((token, tokenIndex) => {
      if (CustomEmoji[token as keyof typeof CustomEmoji]) {
        return <Emoji key={tokenIndex} emojiName={token as keyof typeof CustomEmoji} />;
      }
      return token;
    });
  };

  const renderContentText = () => {
    const lines = text.split(/\r?\n|\r|\n/g);
    return lines.map((line, lineIndex) => {
      return (
        <React.Fragment key={lineIndex}>
          {renderEmojiText(line)}
          {lineIndex < lines.length - 1 && '\n'}
        </React.Fragment>
      );
    });
  };

  // https://www.npmjs.com/package/@ronradtke/react-native-markdown-display
  const markdownStyle = StyleSheet.create({
    text: {
      ...commonStyles.onTwitarrButton,
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
        {renderContentText()}
      </Text>
    </HyperlinkText>
  );
};
