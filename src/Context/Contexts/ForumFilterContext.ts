import {createContext, Dispatch, SetStateAction, useContext} from 'react';

import {ForumFilter, ForumSort, ForumSortDirection} from '#src/Enums/ForumSortFilter';

interface ForumFilterContextType {
  forumSortOrder?: ForumSort;
  setForumSortOrder: Dispatch<SetStateAction<ForumSort | undefined>>;
  forumFilter?: ForumFilter;
  setForumFilter: Dispatch<SetStateAction<ForumFilter | undefined>>;
  forumSortDirection?: ForumSortDirection;
  setForumSortDirection: Dispatch<SetStateAction<ForumSortDirection | undefined>>;
}

export const ForumFilterContext = createContext(<ForumFilterContextType>{});

export const useForumFilter = () => useContext(ForumFilterContext);
