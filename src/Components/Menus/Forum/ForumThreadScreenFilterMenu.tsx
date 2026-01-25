import React from 'react';

import {AppMenu} from '#src/Components/Menus/AppMenu';
import {FilterMenuAnchor} from '#src/Components/Menus/FilterMenuAnchor';
import {SelectableMenuItem} from '#src/Components/Menus/Items/SelectableMenuItem';
import {useForumFilter} from '#src/Context/Contexts/ForumFilterContext';
import {ForumFilter} from '#src/Enums/ForumSortFilter';
import {AppIcons} from '#src/Enums/Icons';
import {useMenu} from '#src/Hooks/useMenu';

export const ForumThreadScreenFilterMenu = () => {
  const {visible, openMenu, closeMenu} = useMenu();
  const {forumFilter, setForumFilter} = useForumFilter();

  const menuAnchor = (
    <FilterMenuAnchor active={!!forumFilter} onPress={openMenu} onLongPress={() => setForumFilter(undefined)} />
  );

  const handleFilterSelection = (filter: ForumFilter) => {
    if (filter === forumFilter) {
      setForumFilter(undefined);
    } else {
      setForumFilter(filter);
    }
    closeMenu();
  };

  return (
    <AppMenu visible={visible} onDismiss={closeMenu} anchor={menuAnchor}>
      <SelectableMenuItem
        title={'Favorites'}
        leadingIcon={AppIcons.favorite}
        selected={forumFilter === ForumFilter.favorite}
        onPress={() => handleFilterSelection(ForumFilter.favorite)}
      />
      <SelectableMenuItem
        title={'Your Forums'}
        leadingIcon={AppIcons.user}
        selected={forumFilter === ForumFilter.owned}
        onPress={() => handleFilterSelection(ForumFilter.owned)}
      />
      <SelectableMenuItem
        title={'Muted'}
        leadingIcon={AppIcons.mute}
        selected={forumFilter === ForumFilter.mute}
        onPress={() => handleFilterSelection(ForumFilter.mute)}
      />
      <SelectableMenuItem
        title={'Unread'}
        leadingIcon={AppIcons.forumUnread}
        selected={forumFilter === ForumFilter.unread}
        onPress={() => handleFilterSelection(ForumFilter.unread)}
      />
    </AppMenu>
  );
};
