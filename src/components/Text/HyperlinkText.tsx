import Clipboard from '@react-native-clipboard/clipboard';
import React from 'react';
import {Hyperlink} from 'react-native-hyperlink';
import {ReactElementWithType} from 'react-native-hyperlink/dist/typescript/src/types';
import URLParse from 'url-parse';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useTwitarr} from '#src/Context/Contexts/TwitarrContext';

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

export const HyperlinkText = ({children}: {children: ReactElementWithType | undefined}) => {
  const {openWebUrl} = useTwitarr();
  const {appConfig} = useConfig();
  const {serverUrl} = useSwiftarrQueryClient();
  const {commonStyles} = useStyles();

  const handleLink = (linkUrl?: string) => {
    if (linkUrl) {
      console.log(`[HyperlinkText.tsx] opening link to ${linkUrl}`);
      openWebUrl(linkUrl);
    }
  };

  const onLongPress = (linkUrl?: string) => {
    if (linkUrl) {
      Clipboard.setString(linkUrl);
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
    <Hyperlink onPress={handleLink} onLongPress={onLongPress} linkStyle={commonStyles.linkText} linkText={handleText}>
      {children}
    </Hyperlink>
  );
};
