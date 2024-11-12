import React, {useState} from 'react';
import {Divider, Menu} from 'react-native-paper';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {ForumSort, ForumSortDirection} from '../../../libraries/Enums/ForumSortFilter';
import {useFilter} from '../../Context/Contexts/FilterContext';
import {SelectableMenuItem} from '../Items/SelectableMenuItem.tsx';
import {MenuAnchor} from '../MenuAnchor.tsx';

export const ForumThreadScreenSortMenu = () => {
  const [visible, setVisible] = useState(false);
  const {forumSortOrder, setForumSortOrder, forumSortDirection, setForumSortDirection} = useFilter();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const menuAnchor = (
    <MenuAnchor
      title={'Filter'}
      active={!!forumSortOrder}
      iconName={AppIcons.sort}
      onPress={openMenu}
      onLongPress={() => setForumSortOrder(undefined)}
    />
  );

  const handleFilterSelection = (filter: ForumSort) => {
    if (filter === forumSortOrder) {
      setForumSortOrder(undefined);
    } else {
      setForumSortOrder(filter);
    }
    closeMenu();
  };

  const handleDirectionSelection = (direction: ForumSortDirection) => {
    if (direction === forumSortDirection) {
      setForumSortDirection(undefined);
    } else {
      setForumSortDirection(direction);
    }
    closeMenu();
  };

  return (
    <Menu visible={visible} onDismiss={closeMenu} anchor={menuAnchor}>
      <SelectableMenuItem
        title={ForumSort.getLabel(ForumSort.event)}
        leadingIcon={AppIcons.events}
        selected={forumSortOrder === ForumSort.event}
        onPress={() => handleFilterSelection(ForumSort.event)}
      />
      <SelectableMenuItem
        title={ForumSort.getLabel(ForumSort.update)}
        leadingIcon={AppIcons.recent}
        selected={forumSortOrder === ForumSort.update}
        onPress={() => handleFilterSelection(ForumSort.update)}
      />
      <SelectableMenuItem
        title={ForumSort.getLabel(ForumSort.create)}
        leadingIcon={AppIcons.new}
        selected={forumSortOrder === ForumSort.create}
        onPress={() => handleFilterSelection(ForumSort.create)}
      />
      <SelectableMenuItem
        title={ForumSort.getLabel(ForumSort.title)}
        leadingIcon={AppIcons.text}
        selected={forumSortOrder === ForumSort.title}
        onPress={() => handleFilterSelection(ForumSort.title)}
      />
      <Divider bold={true} />
      <SelectableMenuItem
        title={'Ascending'}
        leadingIcon={AppIcons.sortAscending}
        selected={forumSortDirection === ForumSortDirection.ascending}
        onPress={() => handleDirectionSelection(ForumSortDirection.ascending)}
      />
      <SelectableMenuItem
        title={'Descending'}
        leadingIcon={AppIcons.sortDescending}
        selected={forumSortDirection === ForumSortDirection.descending}
        onPress={() => handleDirectionSelection(ForumSortDirection.descending)}
      />
    </Menu>
  );
};
