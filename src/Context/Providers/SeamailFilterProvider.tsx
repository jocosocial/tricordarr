import React, {PropsWithChildren, useEffect, useMemo, useState} from 'react';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {SeamailFilterContext} from '#src/Context/Contexts/SeamailFilterContext';
import {FezChatCategory, FezType} from '#src/Enums/FezType';

export const SeamailFilterProvider = ({children}: PropsWithChildren) => {
  const {appConfig} = useConfig();
  const [seamailChatCategories, setSeamailChatCategories] = useState<FezChatCategory[]>([]);
  const [seamailOnlyNew, setSeamailOnlyNew] = useState<boolean | undefined>(undefined);
  const includeLfgs = appConfig.userPreferences.seamailIncludeLfgs ?? true;
  const includePrivateEvents = appConfig.userPreferences.seamailIncludePrivateEvents ?? true;

  const allowedCategories = useMemo(
    () => FezType.allowedChatCategories(includeLfgs, includePrivateEvents),
    [includeLfgs, includePrivateEvents],
  );

  /**
   * Drop LFG from the active type filter when that category is disabled in Chat Settings.
   */
  useEffect(() => {
    if (!includeLfgs) {
      setSeamailChatCategories(prev =>
        prev.includes(FezChatCategory.lfg) ? prev.filter(c => c !== FezChatCategory.lfg) : prev,
      );
    }
  }, [includeLfgs]);

  /**
   * Drop Private Event from the active type filter when that category is disabled in Chat Settings.
   */
  useEffect(() => {
    if (!includePrivateEvents) {
      setSeamailChatCategories(prev =>
        prev.includes(FezChatCategory.privateEvent) ? prev.filter(c => c !== FezChatCategory.privateEvent) : prev,
      );
    }
  }, [includePrivateEvents]);

  const activeChatCategories = useMemo(
    () => seamailChatCategories.filter(c => allowedCategories.includes(c)),
    [seamailChatCategories, allowedCategories],
  );

  const fezType = useMemo(
    () => FezType.fezTypesForChatCategories(activeChatCategories, allowedCategories),
    [activeChatCategories, allowedCategories],
  );

  return (
    <SeamailFilterContext.Provider
      value={{
        seamailChatCategories: activeChatCategories,
        setSeamailChatCategories,
        seamailOnlyNew,
        setSeamailOnlyNew,
        fezType,
        allowedChatCategories: allowedCategories,
      }}>
      {children}
    </SeamailFilterContext.Provider>
  );
};
