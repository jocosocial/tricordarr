import React from 'react';
import {Divider} from 'react-native-paper';

import {AppMenu} from '#src/Components/Menus/AppMenu';
import {SelectableMenuItem} from '#src/Components/Menus/Items/SelectableMenuItem';
import {MenuAnchor} from '#src/Components/Menus/MenuAnchor';
import {useForumFilter} from '#src/Context/Contexts/ForumFilterContext';
import {ForumSort, ForumSortDirection} from '#src/Enums/ForumSortFilter';
import {AppIcons} from '#src/Enums/Icons';
import {useMenu} from '#src/Hooks/useMenu';
import {CategoryData} from '#src/Structs/ControllerStructs';

interface ForumThreadScreenSortMenuProps {
  category?: CategoryData;
}

export const ForumThreadScreenSortMenu = (props: ForumThreadScreenSortMenuProps) => {
  const {visible, openMenu, closeMenu} = useMenu();
  const {forumSortOrder, setForumSortOrder, forumSortDirection, setForumSortDirection} = useForumFilter();

  const menuAnchor = (
    <MenuAnchor
      title={'Filter'}
      active={!!forumSortOrder || !!forumSortDirection}
      iconName={AppIcons.sort}
      onPress={openMenu}
      onLongPress={() => {
        setForumSortOrder(undefined);
        setForumSortDirection(undefined);
      }}
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
    <AppMenu visible={visible} onDismiss={closeMenu} anchor={menuAnchor}>
      {props.category && props.category.isEventCategory && (
        <SelectableMenuItem
          title={ForumSort.getLabel(ForumSort.event)}
          leadingIcon={AppIcons.events}
          selected={forumSortOrder === ForumSort.event}
          onPress={() => handleFilterSelection(ForumSort.event)}
        />
      )}
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
    </AppMenu>
  );
};
