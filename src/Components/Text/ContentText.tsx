import Clipboard from '@react-native-clipboard/clipboard';
import Markdown from '@ronradtke/react-native-markdown-display';
import React, {useCallback, useMemo} from 'react';
import {Linking, Pressable, StyleProp, StyleSheet, TextStyle} from 'react-native';
import {Text} from 'react-native-paper';
import {VariantProp} from 'react-native-paper/lib/typescript/components/Typography/types';

import {Emoji} from '#src/Components/Icons/Emoji';
import {HyperlinkText} from '#src/Components/Text/HyperlinkText';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useErrorHandler} from '#src/Context/Contexts/ErrorHandlerContext';
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
  onLongPress?: () => void;
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
  onLongPress,
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
  const {setErrorBanner} = useErrorHandler();

  // Default onLongPress behavior to copy text to clipboard
  const defaultOnLongPress = useCallback(() => {
    Clipboard.setString(text);
  }, [text]);

  // Use provided onLongPress or default to copy to clipboard
  const handleLongPress = onLongPress || defaultOnLongPress;

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

  // Custom link handler to add app prefix to relative links
  // https://github.com/jocosocial/tricordarr/issues/252
  const handleMarkdownLinkPress = useCallback(
    (url: string) => {
      let processedUrl = url;

      // If the URL is a relative path (starts with /), add the tricordarr:// prefix
      if (url.startsWith('/')) {
        // Remove leading slash since the deep link config doesn't expect it
        processedUrl = `tricordarr://${url.substring(1)}`;
      } else {
        // Check if the URL contains canonical hostnames or starts with the server URL
        let urlToProcess = url;

        // Check and replace canonical hostnames with http/https prefix
        appConfig.apiClientConfig.canonicalHostnames.forEach(hostname => {
          const httpPattern = `http://${hostname}`;
          const httpsPattern = `https://${hostname}`;

          if (urlToProcess.includes(httpPattern)) {
            urlToProcess = urlToProcess.replace(httpPattern, 'tricordarr:/');
          } else if (urlToProcess.includes(httpsPattern)) {
            urlToProcess = urlToProcess.replace(httpsPattern, 'tricordarr:/');
          }
        });

        // Check if the URL starts with the current server URL
        if (appConfig.serverUrl && urlToProcess.startsWith(appConfig.serverUrl)) {
          urlToProcess = urlToProcess.replace(appConfig.serverUrl, 'tricordarr:/');
        }

        processedUrl = urlToProcess;
      }

      // Open the URL with the processed link
      Linking.openURL(processedUrl).catch(err => {
        console.error('[ContentText.tsx] handleMarkdownLinkPress failed to open URL:', processedUrl, err);
        setErrorBanner('Failed to open URL: ' + processedUrl);
      });

      // Return false to prevent default handling
      return false;
    },
    [setErrorBanner, appConfig.apiClientConfig.canonicalHostnames, appConfig.serverUrl],
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

    return (
      <Pressable onLongPress={handleLongPress}>
        <Markdown style={markdownStyle} onLinkPress={handleMarkdownLinkPress}>
          {strippedText}
        </Markdown>
      </Pressable>
    );
  }

  return (
    <HyperlinkText>
      <Text variant={textVariant} style={textStyle} onLongPress={handleLongPress}>
        {renderContentText(text)}
      </Text>
    </HyperlinkText>
  );
};
