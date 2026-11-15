import {createContext, useContext} from 'react';
import {ImageSourcePropType} from 'react-native';

export interface CustomEmojiEntry {
  source: ImageSourcePropType;
  secret: boolean;
  name: string;
}

/** Custom emoji keyed by token, such as `:arr:`. */
export type CustomEmojiCatalog = Record<string, CustomEmojiEntry>;

export const CustomEmojiContext = createContext<CustomEmojiCatalog>({});

/** The custom emoji catalog shared by pickers and post rendering. */
export const useCustomEmoji = () => useContext(CustomEmojiContext);
