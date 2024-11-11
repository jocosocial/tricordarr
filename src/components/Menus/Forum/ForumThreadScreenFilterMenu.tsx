import React, {useState} from 'react';
import {Menu} from 'react-native-paper';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {Item} from 'react-navigation-header-buttons';
import {ForumFilter} from '../../../libraries/Enums/ForumSortFilter';
import {useFilter} from '../../Context/Contexts/FilterContext';
import {useAppTheme} from '../../../styles/Theme';
import {SelectableMenuItem} from '../Items/SelectableMenuItem.tsx';

export const ForumThreadScreenFilterMenu = () => {
  const [visible, setVisible] = useState(false);
  const {forumFilter, setForumFilter} = useFilter();
  const theme = useAppTheme();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const menuAnchor = (
    <Item
      color={forumFilter ? theme.colors.twitarrNeutralButton : undefined}
      title={'Filter'}
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
    <Menu visible={visible} onDismiss={closeMenu} anchor={menuAnchor}>
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
    </Menu>
  );
};
