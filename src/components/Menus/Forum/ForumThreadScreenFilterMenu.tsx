import React, {useState} from 'react';
import {Menu} from 'react-native-paper';
import {AppIcons} from '#src/Libraries/Enums/Icons.ts';
import {ForumFilter} from '#src/Libraries/Enums/ForumSortFilter.ts';
import {useFilter} from '#src/Components/Context/Contexts/FilterContext.ts';
import {SelectableMenuItem} from '#src/Components/Menus/Items/SelectableMenuItem.tsx';
import {MenuAnchor} from '#src/Components/Menus/MenuAnchor.tsx';
import {AppHeaderMenu} from '#src/Components/Menus/AppHeaderMenu.tsx';

export const ForumThreadScreenFilterMenu = () => {
  const [visible, setVisible] = useState(false);
  const {forumFilter, setForumFilter} = useFilter();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const menuAnchor = (
    <MenuAnchor
      title={'Filter'}
      active={!!forumFilter}
      iconName={AppIcons.filter}
      onPress={openMenu}
      onLongPress={() => setForumFilter(undefined)}
    />
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
    <AppHeaderMenu visible={visible} onDismiss={closeMenu} anchor={menuAnchor}>
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
    </AppHeaderMenu>
  );
};
