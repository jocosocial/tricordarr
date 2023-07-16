import React from 'react';
import {Text} from 'react-native-paper';
import {StyleProp, TextStyle} from 'react-native';
import {CustomEmoji} from '../../libraries/Enums/Emoji';
import {Emoji} from '../Images/Emoji';

interface ContentTextProps {
  textStyle?: StyleProp<TextStyle>;
  text: string;
}

/**
 * Text view to render content with our various filters applied. Filters such as emoji and Markdown.
 */
export const ContentText = ({textStyle, text}: ContentTextProps) => {
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

  return <Text style={textStyle}>{renderContentText()}</Text>;
};
