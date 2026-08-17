import React, {type ReactElement, type ReactNode} from 'react';
import {Linking, type TextProps, type ViewProps} from 'react-native';
import {Hyperlink} from 'react-native-hyperlink';
import URLParse from 'url-parse';

import {LinkPillText} from '#src/Components/Text/LinkPillText';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useLinking} from '#src/Context/Contexts/LinkingContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {AppIcons} from '#src/Enums/Icons';
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
  {pattern: /\/tweets.*/, label: 'Twarrt Link', icon: AppIcons.postSelf},
  {pattern: /\/forums\/[a-zA-Z0-9]+$/, label: 'Forum Category Link', icon: AppIcons.forum},
  {pattern: /\/forums$/, label: 'Forum Categories Link', icon: AppIcons.forum},
  {pattern: /\/forum\/[a-zA-Z0-9]+/, label: 'Forum Link', icon: AppIcons.forum},
  {pattern: /\/seamail.*/, label: 'Seamail Link', icon: AppIcons.seamail},
  {pattern: /\/lfg\/joined/, label: 'Joined LFGs Link', icon: AppIcons.lfg},
  {pattern: /\/lfg\/owned/, label: 'Your LFGs Link', icon: AppIcons.lfg},
  {pattern: /\/lfg\/faq/, label: 'LFG FAQ Link]', icon: AppIcons.lfg},
  {pattern: /\/lfg.*/, label: 'LFG Link', icon: AppIcons.lfg},
  {pattern: /\/events.*/, label: 'Events Link', icon: AppIcons.events},
  {pattern: /\/(user|profile).*/, label: 'User Link', icon: AppIcons.user},
  {pattern: /\/boardgames.*/, label: 'Boardgame Link', icon: AppIcons.games},
  {pattern: /\/karaoke.*/, label: 'Karaoke Link', icon: AppIcons.karaoke},
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

  const handleText = (linkUrl: string): ReactNode => {
    const linkUrlObject = new URLParse(linkUrl);
    if (
      linkUrl.startsWith(serverUrl) ||
      appConfig.apiClientConfig.canonicalHostnames.includes(linkUrlObject.hostname)
    ) {
      const matchedMapping = urlPathLabelMappings.find(mapping => {
        return mapping.pattern.test(linkUrl);
      });
      if (matchedMapping) {
        return <LinkPillText icon={matchedMapping.icon} label={matchedMapping.label} />;
      } else {
        return <LinkPillText icon={AppIcons.twitarr} label={'Twitarr Link'} />;
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
      // react-native-hyperlink types linkText as returning string, but it only uses the value as JSX children.
      linkText={disableLinkInterpolation ? undefined : (handleText as unknown as (url: string) => string)}>
      {children}
    </Hyperlink>
  );
};
