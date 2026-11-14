import {useMemo} from 'react';
import {ImageSourcePropType} from 'react-native';

import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useOpenQuery} from '#src/Queries/OpenQuery';

interface CustomEmojiData {
  reaction: string;
  name: string;
  imageURL: string;
}

interface CustomEmojiEntry {
  source: ImageSourcePropType;
  secret: boolean;
  name: string;
}

/** Shares the server's public emoji catalog across pickers and post rendering. */
export const useCustomEmoji = () => {
  const {serverUrl} = useSwiftarrQueryClient();
  const {data} = useOpenQuery<CustomEmojiData[]>('/client/emoji', {staleTime: 24 * 60 * 60 * 1000});
  return useMemo(() => {
    const emojis: Record<string, CustomEmojiEntry> = {
      ':mbta:': {source: require('#assets/emoji/small/mbta.png'), secret: true, name: 'mbta'},
    };
    for (const emoji of data ?? []) {
      emojis[emoji.reaction] = {
        source: {uri: new URL(emoji.imageURL, serverUrl).toString()},
        secret: false,
        name: emoji.name,
      };
    }
    return emojis;
  }, [data, serverUrl]);
};
