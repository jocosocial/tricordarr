import Markdown, {ASTNode, RenderRules} from '@ronradtke/react-native-markdown-display';
import React, {useCallback, useMemo} from 'react';
import {Linking, StyleProp, StyleSheet, TextStyle} from 'react-native';
import {Text} from 'react-native-paper';
import {VariantProp} from 'react-native-paper/lib/typescript/components/Typography/types';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useErrorHandler} from '#src/Context/Contexts/ErrorHandlerContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';

interface MarkdownTextProps {
  text: string;
  textStyle?: StyleProp<TextStyle>;
  textVariant?: VariantProp<never>;
  selectable?: boolean;
}

/**
 * Component to render Markdown text with custom styling and link handling.
 */
export const MarkdownText = ({text, textStyle, textVariant, selectable = true}: MarkdownTextProps) => {
  const {commonStyles, styleDefaults} = useStyles();
  const {appConfig} = useConfig();
  const {setErrorBanner} = useErrorHandler();

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
        console.error('[MarkdownText.tsx] handleMarkdownLinkPress failed to open URL:', processedUrl, err);
        setErrorBanner('Failed to open URL: ' + processedUrl);
      });

      // Return false to prevent default handling
      return false;
    },
    [setErrorBanner, appConfig.apiClientConfig.canonicalHostnames, appConfig.serverUrl],
  );

  // https://www.npmjs.com/package/@ronradtke/react-native-markdown-display
  const markdownStyle = useMemo(
    () =>
      StyleSheet.create({
        text: {
          ...commonStyles.onBackground,
          ...(textStyle as TextStyle),
        },
        body: {
          fontSize: styleDefaults.fontSize,
        },
      }),
    [commonStyles.onBackground, textStyle, styleDefaults.fontSize],
  );

  // Custom render rules to make text groups selectable.
  // Cursor wrote all of this.
  const markdownRules: RenderRules = useMemo(
    () => ({
      // eslint-disable-next-line react/no-unstable-nested-components
      textgroup: (node: ASTNode, children, parentNodes, styles) => {
        // Determine variant based on markdown tree structure (header level)
        let variant: VariantProp<never> | undefined = textVariant;

        // Check parent nodes to see if we're inside a heading
        if (parentNodes && parentNodes.length > 0) {
          // Find the closest heading parent node
          const headingParent = parentNodes.find((parent: ASTNode) => {
            const type = parent.type;
            return type && (type.startsWith('heading') || type.startsWith('h') || type === 'heading');
          });

          if (headingParent) {
            let level: number | undefined;
            // Try to extract level from type (e.g., "heading1" -> 1, "h2" -> 2)
            const headingMatch = headingParent.type.match(/(?:heading|h)(\d+)/);
            if (headingMatch) {
              level = parseInt(headingMatch[1], 10);
            } else if ((headingParent as any).depth) {
              // Some markdown parsers use a depth property
              level = (headingParent as any).depth;
            }

            if (level) {
              // Map heading levels to appropriate variants
              switch (level) {
                case 1:
                  variant = 'headlineMedium';
                  break;
                case 2:
                  variant = 'titleLarge';
                  break;
                case 3:
                  variant = 'titleMedium';
                  break;
                case 4:
                  variant = 'titleSmall';
                  break;
                default:
                  variant = 'bodyLarge';
              }
            }
          }
        }

        return (
          <Text key={node.key} variant={variant} style={styles.text} selectable={selectable}>
            {children}
          </Text>
        );
      },
    }),
    [selectable, textVariant],
  );

  const markdownIdentifier = '<Markdown>';
  const strippedText = text.replace(markdownIdentifier, '').trim();

  return (
    <Markdown style={markdownStyle} rules={markdownRules} onLinkPress={handleMarkdownLinkPress}>
      {strippedText}
    </Markdown>
  );
};
