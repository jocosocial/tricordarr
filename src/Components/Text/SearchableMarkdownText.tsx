import Markdown, {ASTNode, RenderRules} from '@ronradtke/react-native-markdown-display';
import React, {useMemo} from 'react';
import {StyleProp, TextStyle} from 'react-native';
import {Text} from 'react-native-paper';
import {VariantProp} from 'react-native-paper/lib/typescript/components/Typography/types';

import {
  createTextgroupRule,
  stripMarkdownIdentifier,
  useMarkdownLinkHandler,
  useMarkdownStyles,
} from '#src/Components/Text/MarkdownUtils';
import {useAppTheme} from '#src/Styles/Theme';

interface SearchableMarkdownTextProps {
  text: string;
  textStyle?: StyleProp<TextStyle>;
  textVariant?: VariantProp<never>;
  selectable?: boolean;
  searchQuery?: string;
  highlightedMatchIndex?: number;
}

/**
 * Component to render Markdown text with search highlighting support.
 * Wraps MarkdownText with search functionality.
 */
export const SearchableMarkdownText = ({
  text,
  textStyle,
  textVariant,
  selectable = true,
  searchQuery = '',
  highlightedMatchIndex: _highlightedMatchIndex,
}: SearchableMarkdownTextProps) => {
  const theme = useAppTheme();
  const handleMarkdownLinkPress = useMarkdownLinkHandler();
  const markdownStyle = useMarkdownStyles(textStyle);

  // Process text - no modification needed, we'll handle highlighting in render rules
  const processedText = useMemo(() => stripMarkdownIdentifier(text), [text]);

  // Calculate all match positions in the text for global indexing
  const allMatches = useMemo(() => {
    if (!searchQuery || searchQuery.trim().length === 0) {
      return [];
    }
    const query = searchQuery.trim();
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedQuery, 'gi');
    return Array.from(processedText.matchAll(regex));
  }, [processedText, searchQuery]);

  // Custom render rules for highlighting and text groups
  const markdownRules: RenderRules = useMemo(() => {
    if (!searchQuery || searchQuery.trim().length === 0) {
      // No search, use standard textgroup rendering
      return {
        textgroup: createTextgroupRule(textVariant, selectable),
      };
    }

    // With search, intercept text nodes to highlight matches
    const query = searchQuery.trim();
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const searchRegex = new RegExp(escapedQuery, 'gi');

    // Use a ref to track the current position in processedText for global match indexing
    let textOffset = 0;

    return {
      // eslint-disable-next-line react/no-unstable-nested-components
      text: (node: ASTNode, children, _parentNodes, _styles) => {
        const nodeContent = (node as any).content || String(children || '');
        if (!nodeContent || typeof nodeContent !== 'string') {
          return <Text key={node.key}>{children}</Text>;
        }

        const nodeStartInText = processedText.indexOf(nodeContent, textOffset);
        if (nodeStartInText >= 0) {
          textOffset = nodeStartInText + nodeContent.length;
        }

        const matches = Array.from(nodeContent.matchAll(searchRegex));
        if (matches.length === 0) {
          return <Text key={node.key}>{nodeContent}</Text>;
        }

        // Split text and highlight matches
        const parts: React.ReactNode[] = [];
        let lastIndex = 0;

        matches.forEach(match => {
          if (match.index !== undefined) {
            // Add text before match
            if (match.index > lastIndex) {
              parts.push(nodeContent.substring(lastIndex, match.index));
            }

            const matchText = match[0];
            // Calculate global match index
            const matchStartInText = nodeStartInText >= 0 ? nodeStartInText + match.index : -1;
            const globalMatchIndex = allMatches.findIndex(m => (m.index ?? -1) === matchStartInText);

            // Add highlighted match
            parts.push(
              <Text
                key={`match-${globalMatchIndex}-${match.index}`}
                style={{
                  backgroundColor: theme.colors.twitarrYellow,
                  color: theme.colors.onTwitarrYellow,
                }}>
                {matchText}
              </Text>,
            );

            lastIndex = match.index + matchText.length;
          }
        });

        // Add remaining text
        if (lastIndex < nodeContent.length) {
          parts.push(nodeContent.substring(lastIndex));
        }

        return <Text key={node.key}>{parts}</Text>;
      },
      textgroup: createTextgroupRule(textVariant, selectable),
    };
  }, [selectable, textVariant, theme.colors, searchQuery, processedText, allMatches]);

  return (
    <Markdown style={markdownStyle} rules={markdownRules} onLinkPress={handleMarkdownLinkPress}>
      {processedText}
    </Markdown>
  );
};
