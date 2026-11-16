import {createContext, useContext} from 'react';

import {CustomEmojiCatalog, emptyCustomEmojiCatalog} from '#src/Libraries/Reactions/CustomEmojiCatalog';

export const CustomEmojiContext = createContext<CustomEmojiCatalog>(emptyCustomEmojiCatalog());

/** The custom emoji catalog shared by pickers and post rendering. */
export const useCustomEmoji = () => useContext(CustomEmojiContext);
