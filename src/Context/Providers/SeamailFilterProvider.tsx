import React, {PropsWithChildren, useState} from 'react';

import {SeamailFilterContext} from '#src/Context/Contexts/SeamailFilterContext';
import {FezChatCategory} from '#src/Enums/FezType';

export const SeamailFilterProvider = ({children}: PropsWithChildren) => {
  const [seamailChatCategories, setSeamailChatCategories] = useState<FezChatCategory[]>([]);
  const [seamailOnlyNew, setSeamailOnlyNew] = useState<boolean | undefined>(undefined);

  return (
    <SeamailFilterContext.Provider
      value={{
        seamailChatCategories,
        setSeamailChatCategories,
        seamailOnlyNew,
        setSeamailOnlyNew,
      }}>
      {children}
    </SeamailFilterContext.Provider>
  );
};
