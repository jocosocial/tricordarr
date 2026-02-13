import {ASTNode, RenderRules} from '@ronradtke/react-native-markdown-display';
import {useCallback, useMemo} from 'react';
import {StyleProp, StyleSheet, TextStyle} from 'react-native';
import {Text} from 'react-native-paper';
import {VariantProp} from 'react-native-paper/lib/typescript/components/Typography/types';

import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useTwitarr} from '#src/Context/Contexts/TwitarrContext';

/**
 * Hook to create markdown link handler that processes URLs for deep linking.
 * Delegates to LinkingProvider (useTwitarr().openWebUrl) for URL processing.
 * https://github.com/jocosocial/tricordarr/issues/252
 */
export const useMarkdownLinkHandler = () => {
  const {openWebUrl} = useTwitarr();

  return useCallback(
    (url: string) => {
      openWebUrl(url);
      // Return false to prevent default handling by the markdown library
      return false;
    },
    [openWebUrl],
  );
};

/**
 * Hook to create markdown styles.
 */
export const useMarkdownStyles = (textStyle?: StyleProp<TextStyle>) => {
  const {commonStyles, styleDefaults} = useStyles();

  return useMemo(
    () =>
      StyleSheet.create({
        text: {
          ...commonStyles.onBackground,
          ...(textStyle as TextStyle),
        },
        body: {
          fontSize: styleDefaults.fontSize,
        },
        code_inline: {
          ...commonStyles.background,
          ...commonStyles.onBackground,
        },
        code_block: {
          ...commonStyles.background,
          ...commonStyles.onBackground,
        },
        fence: {
          ...commonStyles.background,
          ...commonStyles.onBackground,
        },
      }),
    [commonStyles.onBackground, commonStyles.background, textStyle, styleDefaults.fontSize],
  );
};

/**
 * Determines the text variant based on heading level in parent nodes.
 */
export const getHeadingVariant = (
  parentNodes: ASTNode[] | undefined,
  defaultVariant?: VariantProp<never>,
): VariantProp<never> | undefined => {
  let variant: VariantProp<never> | undefined = defaultVariant;

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

  return variant;
};

/**
 * Creates a textgroup render rule for markdown.
 */
export const createTextgroupRule = (
  textVariant?: VariantProp<never>,
  selectable: boolean = true,
): RenderRules['textgroup'] => {
  return (node: ASTNode, children, parentNodes, styles) => {
    const variant = getHeadingVariant(parentNodes, textVariant);

    return (
      <Text key={node.key} variant={variant} style={styles.text} selectable={selectable}>
        {children}
      </Text>
    );
  };
};

/**
 * Strips the markdown identifier from text.
 */
export const stripMarkdownIdentifier = (text: string): string => {
  const markdownIdentifier = '<Markdown>';
  return text.replace(markdownIdentifier, '').trim();
};
