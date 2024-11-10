import React, {useState} from 'react';
import {Divider, Menu} from 'react-native-paper';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {Item} from 'react-navigation-header-buttons';
import {ForumSort, ForumSortDirection} from '../../../libraries/Enums/ForumSortFilter';
import {useFilter} from '../../Context/Contexts/FilterContext';
import {useAppTheme} from '../../../styles/Theme';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {SelectableMenuItem} from '../Items/SelectableMenuItem.tsx';

export const ForumThreadScreenSortMenu = () => {
  const [visible, setVisible] = useState(false);
  const {forumSortOrder, setForumSortOrder, forumSortDirection, setForumSortDirection} = useFilter();
  const theme = useAppTheme();
  const {commonStyles} = useStyles();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const menuAnchor = (
    <Item
      color={forumSortOrder ? theme.colors.twitarrNeutralButton : undefined}
      title={'Filter'}
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
      <Menu.Item
        title={'Event Time'}
        leadingIcon={AppIcons.events}
        onPress={() => handleFilterSelection(ForumSort.event)}
        style={forumSortOrder === ForumSort.event ? commonStyles.surfaceVariant : undefined}
        trailingIcon={forumSortOrder === ForumSort.event ? AppIcons.check : undefined}
      />
      <Menu.Item
        title={'Most Recent Post'}
        leadingIcon={AppIcons.recent}
        onPress={() => handleFilterSelection(ForumSort.update)}
        style={forumSortOrder === ForumSort.update ? commonStyles.surfaceVariant : undefined}
        trailingIcon={forumSortOrder === ForumSort.update ? AppIcons.check : undefined}
      />
      <Menu.Item
        title={'Creation Time'}
        leadingIcon={AppIcons.new}
        onPress={() => handleFilterSelection(ForumSort.create)}
        style={forumSortOrder === ForumSort.create ? commonStyles.surfaceVariant : undefined}
        trailingIcon={forumSortOrder === ForumSort.create ? AppIcons.check : undefined}
      />
      <Menu.Item
        title={'Title'}
        leadingIcon={AppIcons.text}
        onPress={() => handleFilterSelection(ForumSort.title)}
        style={forumSortOrder === ForumSort.title ? commonStyles.surfaceVariant : undefined}
        trailingIcon={forumSortOrder === ForumSort.title ? AppIcons.check : undefined}
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
