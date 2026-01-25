import React, {PropsWithChildren, useState} from 'react';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {ForumFilterContext} from '#src/Context/Contexts/ForumFilterContext';
import {ForumFilter, ForumSort, ForumSortDirection} from '#src/Enums/ForumSortFilter';

export const ForumFilterProvider = ({children}: PropsWithChildren) => {
  const {appConfig} = useConfig();
  const [forumFilter, setForumFilter] = useState<ForumFilter>();
  const [forumSortOrder, setForumSortOrder] = useState<ForumSort | undefined>(
    appConfig.userPreferences.defaultForumSortOrder,
  );
  const [forumSortDirection, setForumSortDirection] = useState<ForumSortDirection | undefined>(
    appConfig.userPreferences.defaultForumSortDirection,
  );

  return (
    <ForumFilterContext.Provider
      value={{
        forumFilter,
        setForumFilter,
        forumSortOrder,
        setForumSortOrder,
        forumSortDirection,
        setForumSortDirection,
      }}>
      {children}
    </ForumFilterContext.Provider>
  );
};
