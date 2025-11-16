import Markdown, {RenderRules} from '@ronradtke/react-native-markdown-display';
import React, {useMemo} from 'react';
import {StyleProp, TextStyle} from 'react-native';
import {VariantProp} from 'react-native-paper/lib/typescript/components/Typography/types';

import {
  createTextgroupRule,
  stripMarkdownIdentifier,
  useMarkdownLinkHandler,
  useMarkdownStyles,
} from '#src/Components/Text/MarkdownUtils';

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
  const handleMarkdownLinkPress = useMarkdownLinkHandler();
  const markdownStyle = useMarkdownStyles(textStyle);

  // Custom render rules to make text groups selectable.
  const markdownRules: RenderRules = useMemo(
    () => ({
      textgroup: createTextgroupRule(textVariant, selectable),
    }),
    [selectable, textVariant],
  );

  const strippedText = stripMarkdownIdentifier(text);

  return (
    <Markdown style={markdownStyle} rules={markdownRules} onLinkPress={handleMarkdownLinkPress}>
      {strippedText}
    </Markdown>
  );
};
