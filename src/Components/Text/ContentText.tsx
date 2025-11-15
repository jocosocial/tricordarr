import React, {useCallback, useMemo} from 'react';
import {StyleProp, TextStyle} from 'react-native';
import {Text} from 'react-native-paper';
import {VariantProp} from 'react-native-paper/lib/typescript/components/Typography/types';

import {Emoji} from '#src/Components/Icons/Emoji';
import {HyperlinkText} from '#src/Components/Text/HyperlinkText';
import {MarkdownText} from '#src/Components/Text/MarkdownText';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {CustomEmoji} from '#src/Enums/Emoji';
import {useUserKeywordQuery} from '#src/Queries/User/UserQueries';

interface ContentTextProps {
  textStyle?: StyleProp<TextStyle>;
  text: string;
  textVariant?: VariantProp<never>;
  hashtagOnPress?: (tag: string) => void;
  mentionOnPress?: (username: string) => void;
  forceMarkdown?: boolean;
  selectable?: boolean;
}

// ChatGPT wrote this. Needed something to deal with newline characters appearing
// mid-paragraph. Wish we had pre-commit linting rules, but oh well...
// const cleanMarkdownText = (text: string) => {
//   // Split text into blocks based on double newlines
//   const blocks = text.split(/\n\n/);
//
//   const cleanedBlocks = blocks.map(block => {
//     // Check if the block contains list items
//     if (/^[-*]\s+/m.test(block)) {
//       // For blocks with list items, preserve each line starting with - or *
//       return block
//         .split('\n')
//         .map(line => {
//           // If it's a list item, keep it as is; otherwise, clean it
//           return /^[-*]\s+/.test(line) ? line : line.replace(/\n+/g, ' ');
//         })
//         .join('\n'); // Rejoin with single newline to preserve formatting
//     } else {
//       // For regular paragraphs, remove single newlines
//       return block.replace(/\n+/g, ' ');
//     }
//   });
//
//   // Join the cleaned blocks with double newlines
//   return cleanedBlocks.join('\n\n');
// };

/**
 * Text view to render content with our various filters applied. Filters such as emoji and Markdown.
 */
export const ContentText = ({
  textStyle,
  text,
  textVariant,
  hashtagOnPress,
  mentionOnPress,
  forceMarkdown,
  selectable = true,
}: ContentTextProps) => {
  const {commonStyles} = useStyles();
  const {data} = useUserKeywordQuery({
    keywordType: 'alertwords',
    options: {
      enabled: false,
    },
  });
  const undWords = useMemo(() => data?.keywords.map(aw => aw.toLowerCase()) || [], [data]);
  const {appConfig} = useConfig();

  const renderEmojiText = useCallback(
    (
      line: string,
      hashtagOnPressFunction?: (tag: string) => void,
      mentionOnPressFunction?: (username: string) => void,
    ) => {
      // @TODO this is matching to much hashtag, but TBH that's not the end of the world.
      // This is some write-once-read-never nonsense
      const tokens = line.split(
        /(:[\w-]+:)|((?<!\S)@[A-Za-z0-9]+(?:[-.+_][A-Za-z0-9]+)*)|((?<!\S)#[A-Za-z0-9]+(?!\\S))/g,
      );
      return tokens.map((token, tokenIndex) => {
        if (!token) {
          return;
        }
        if (CustomEmoji[token as keyof typeof CustomEmoji]) {
          return <Emoji key={tokenIndex} emojiName={token as keyof typeof CustomEmoji} />;
        }
        if (hashtagOnPressFunction && token.startsWith('#')) {
          return (
            <Text key={tokenIndex} style={commonStyles.linkText} onPress={() => hashtagOnPressFunction(token)}>
              {token}
            </Text>
          );
        }
        if (mentionOnPressFunction && token.startsWith('@')) {
          return (
            <Text key={tokenIndex} style={commonStyles.linkText} onPress={() => mentionOnPressFunction(token)}>
              {token}
            </Text>
          );
        }
        if (appConfig.userPreferences.highlightForumAlertWords) {
          undWords.forEach(word => {
            // ChatGPT came up with this
            const regex = new RegExp(`\\b(${word})\\b`, 'gi'); // 'gi' for global and case-insensitive
            token = token.replace(regex, match => {
              return `🚨${match}🚨`;
            });
          });
        }
        return token;
      });
    },
    [appConfig.userPreferences.highlightForumAlertWords, commonStyles.linkText, undWords],
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

  const markdownIdentifier = '<Markdown>';
  if (forceMarkdown || text.startsWith(markdownIdentifier)) {
    return <MarkdownText text={text} textStyle={textStyle} textVariant={textVariant} selectable={selectable} />;
  }

  /**
   * Do not implement onPress or onLongPress in this component. It's used so often in places
   * that may not be touchable/selectable that it interrupts any touchable containers.
   */
  return (
    <HyperlinkText>
      <Text variant={textVariant} style={textStyle} selectable={selectable}>
        {renderContentText(text)}
      </Text>
    </HyperlinkText>
  );
};
