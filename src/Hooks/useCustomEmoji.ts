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

/**
 * Emoji shipped inside the app. The ship's wifi is unreliable, so these must render with no network:
 * on a cold query cache the server catalog hasn't arrived yet, and even a cached catalog only holds
 * image URLs that still have to be downloaded.
 */
const bundledEmoji: Record<string, CustomEmojiEntry> = {
  ':arr:': {source: require('#assets/emoji/small/arr.png'), secret: false, name: 'arr'},
  ':back-deck-juice:': {
    source: require('#assets/emoji/small/back-deck-juice.png'),
    secret: false,
    name: 'back-deck-juice',
  },
  ':buffet:': {source: require('#assets/emoji/small/buffet.png'), secret: false, name: 'buffet'},
  ':die:': {source: require('#assets/emoji/small/die.png'), secret: false, name: 'die'},
  ':die-ship:': {source: require('#assets/emoji/small/die-ship.png'), secret: false, name: 'die-ship'},
  ':hottub:': {source: require('#assets/emoji/small/hottub.png'), secret: false, name: 'hottub'},
  ':joco:': {source: require('#assets/emoji/small/joco.png'), secret: false, name: 'joco'},
  ':pirate:': {source: require('#assets/emoji/small/pirate.png'), secret: false, name: 'pirate'},
  ':ship:': {source: require('#assets/emoji/small/ship.png'), secret: false, name: 'ship'},
  ':ship-front:': {source: require('#assets/emoji/small/ship-front.png'), secret: false, name: 'ship-front'},
  ':tropical-drink:': {
    source: require('#assets/emoji/small/tropical-drink.png'),
    secret: false,
    name: 'tropical-drink',
  },
  ':wangwang:': {source: require('#assets/emoji/small/wangwang.png'), secret: false, name: 'wangwang'},
  ':zombie:': {source: require('#assets/emoji/small/zombie.png'), secret: false, name: 'zombie'},
  ':mbta:': {source: require('#assets/emoji/small/mbta.png'), secret: true, name: 'mbta'},
};

/**
 * Shares the custom emoji catalog across pickers and post rendering.
 *
 * Starts from the bundled set and lets the server catalog extend it, so emoji the server adds after
 * this build shipped still appear. Where both know an emoji, the bundled image wins because it needs
 * no download.
 */
export const useCustomEmoji = () => {
  const {serverUrl} = useSwiftarrQueryClient();
  const {data} = useOpenQuery<CustomEmojiData[]>('/client/emoji', {staleTime: 24 * 60 * 60 * 1000});
  return useMemo(() => {
    const emojis: Record<string, CustomEmojiEntry> = {...bundledEmoji};
    for (const emoji of data ?? []) {
      emojis[emoji.reaction] = {
        source: bundledEmoji[emoji.reaction]?.source ?? {uri: new URL(emoji.imageURL, serverUrl).toString()},
        secret: false,
        name: emoji.name,
      };
    }
    return emojis;
  }, [data, serverUrl]);
};
