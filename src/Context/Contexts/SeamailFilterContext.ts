import {createContext, Dispatch, SetStateAction, useContext} from 'react';

import {FezChatCategory, FezType} from '#src/Enums/FezType';

interface SeamailFilterContextType {
  seamailChatCategories: FezChatCategory[];
  setSeamailChatCategories: Dispatch<SetStateAction<FezChatCategory[]>>;
  seamailOnlyNew: boolean | undefined;
  setSeamailOnlyNew: Dispatch<SetStateAction<boolean | undefined>>;
  fezType: FezType[];
  allowedChatCategories: FezChatCategory[];
}

export const SeamailFilterContext = createContext(<SeamailFilterContextType>{});

export const useSeamailFilter = () => useContext(SeamailFilterContext);
