import React, {useCallback, useMemo} from 'react';
import {Text} from 'react-native-paper';
import {StyleProp, StyleSheet, TextStyle} from 'react-native';
import {CustomEmoji} from '#src/Enums/Emoji';
import {Emoji} from '#src/Components/Icons/Emoji';
import Markdown from '@ronradtke/react-native-markdown-display';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {HyperlinkText} from '#src/Components/Text/HyperlinkText';
import {VariantProp} from 'react-native-paper/lib/typescript/components/Typography/types';
import {useUserKeywordQuery} from '#src/Queries/User/UserQueries';
import {useConfig} from '#src/Context/Contexts/ConfigContext';

interface ContentTextProps {
  textStyle?: StyleProp<TextStyle>;
  text: string;
  textVariant?: VariantProp<never>;
  hashtagOnPress?: (tag: string) => void;
  mentionOnPress?: (username: string) => void;
  forceMarkdown?: boolean;
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
 * @TODO this may need cleaned up and refactored to be more generic with content views.
 * Right now it's just announcements.
 */
export const ContentText = ({
  textStyle,
  text,
  textVariant,
  hashtagOnPress,
  mentionOnPress,
  forceMarkdown,
}: ContentTextProps) => {
  const {commonStyles, styleDefaults} = useStyles();
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

  // https://www.npmjs.com/package/@ronradtke/react-native-markdown-display
  const markdownStyle = StyleSheet.create({
    text: {
      ...commonStyles.onBackground,
      ...(textStyle as TextStyle),
    },
    body: {
      fontSize: styleDefaults.fontSize,
    },
  });

  const markdownIdentifier = '<Markdown>';
  if (forceMarkdown || text.startsWith(markdownIdentifier)) {
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
