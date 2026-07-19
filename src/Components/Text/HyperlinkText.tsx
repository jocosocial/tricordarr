import React, {type ReactElement, type ReactNode} from 'react';
import {Linking, type TextProps, type ViewProps} from 'react-native';
import {Hyperlink} from 'react-native-hyperlink';
import URLParse from 'url-parse';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useLinking} from '#src/Context/Contexts/LinkingContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useClipboard} from '#src/Hooks/useClipboard';
import {createLogger} from '#src/Libraries/Logger';

const logger = createLogger('HyperlinkText.tsx');

type ReactElementWithType = ReactElement<TextProps | ViewProps> & {
  type?: {
    displayName?: string;
  };
  props: (TextProps | ViewProps) & {
    children?: ReactNode;
    style?: TextProps['style'] | ViewProps['style'];
    [key: string]: unknown;
  };
};

// https://github.com/jocosocial/swiftarr/blob/master/Sources/App/Site/Utilities/CustomLeafTags.swift
const urlPathLabelMappings = [
  {pattern: /\/tweets.*/, label: 'Twarrt Link'},
  {pattern: /\/forums\/[a-zA-Z0-9]+$/, label: 'Forum Category Link'},
  {pattern: /\/forums$/, label: 'Forum Categories Link'},
  {pattern: /\/forum\/[a-zA-Z0-9]+/, label: 'Forum Link'},
  {pattern: /\/seamail.*/, label: 'Seamail Link'},
  {pattern: /\/fez\/joined/, label: 'Joined LFGs Link'},
  {pattern: /\/fez\/owned/, label: 'Your LFGs Link'},
  {pattern: /\/fez\/faq/, label: 'LFG FAQ Link]'},
  {pattern: /\/fez.*/, label: 'LFG Link'},
  {pattern: /\/events.*/, label: 'Events Link'},
  {pattern: /\/(user|profile).*/, label: 'User Link'},
  {pattern: /\/boardgames.*/, label: 'Boardgame Link'},
  {pattern: /\/karaoke.*/, label: 'Karaoke Link'},
];

interface HyperlinkTextProps {
  children: ReactElementWithType | undefined;
  disableLinkInterpolation?: boolean;
}

export const HyperlinkText = ({children, disableLinkInterpolation = false}: HyperlinkTextProps) => {
  const {openWebUrl} = useLinking();
  const {appConfig} = useConfig();
  const {serverUrl} = useSwiftarrQueryClient();
  const {commonStyles} = useStyles();
  const {setString} = useClipboard();

  const handleLink = (linkUrl?: string) => {
    if (linkUrl) {
      logger.debug(`Opening link to ${linkUrl}`);
      if (disableLinkInterpolation) {
        // Open externally, not using the openWebUrl function.
        Linking.openURL(linkUrl);
      } else {
        openWebUrl(linkUrl);
      }
    }
  };

  const onLongPress = (linkUrl?: string) => {
    if (linkUrl) {
      setString(linkUrl);
    }
  };

  const handleText = (linkUrl: string) => {
    const linkUrlObject = new URLParse(linkUrl);
    if (
      linkUrl.startsWith(serverUrl) ||
      appConfig.apiClientConfig.canonicalHostnames.includes(linkUrlObject.hostname)
    ) {
      const matchedMapping = urlPathLabelMappings.find(mapping => {
        return mapping.pattern.test(linkUrl);
      });
      if (matchedMapping) {
        return `[${matchedMapping.label}]`;
      } else {
        return '[Twitarr Link]';
      }
    }

    // ChatGPT
    const prefixes = ['mailto:', 'http://', 'https://'];
    for (const prefix of prefixes) {
      if (linkUrl.startsWith(prefix) && linkUrl.length > prefix.length) {
        return linkUrl.slice(prefix.length);
      }
    }

    return linkUrl;
  };

  return (
    <Hyperlink
      onPress={handleLink}
      onLongPress={onLongPress}
      linkStyle={commonStyles.linkText}
      linkText={disableLinkInterpolation ? undefined : handleText}>
      {children}
    </Hyperlink>
  );
};
