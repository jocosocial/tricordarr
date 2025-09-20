import React, {useState} from 'react';
import {Divider, Menu} from 'react-native-paper';
import {AppIcons} from '#src/Libraries/Enums/Icons.ts';
import {ForumSort, ForumSortDirection} from '#src/Libraries/Enums/ForumSortFilter.ts';
import {useFilter} from '#src/Components/Context/Contexts/FilterContext.ts';
import {SelectableMenuItem} from '#src/Components/Menus/Items/SelectableMenuItem.tsx';
import {MenuAnchor} from '#src/Components/Menus/MenuAnchor.tsx';
import {CategoryData} from '#src/Libraries/Structs/ControllerStructs.tsx';
import {AppHeaderMenu} from '#src/Components/Menus/AppHeaderMenu.tsx';

interface ForumThreadScreenSortMenuProps {
  category?: CategoryData;
}

export const ForumThreadScreenSortMenu = (props: ForumThreadScreenSortMenuProps) => {
  const [visible, setVisible] = useState(false);
  const {forumSortOrder, setForumSortOrder, forumSortDirection, setForumSortDirection} = useFilter();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

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
    <AppHeaderMenu visible={visible} onDismiss={closeMenu} anchor={menuAnchor}>
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
    </AppHeaderMenu>
  );
};
