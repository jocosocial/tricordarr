import React, {useState} from 'react';
import {Divider, Menu} from 'react-native-paper';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {Item} from 'react-navigation-header-buttons';
import {ForumSortOrder} from '../../../libraries/Enums/ForumSortFilter';
import {useFilter} from '../../Context/Contexts/FilterContext';
import {useAppTheme} from '../../../styles/Theme';
import {useStyles} from '../../Context/Contexts/StyleContext';

export const ForumThreadScreenSortMenu = () => {
  const [visible, setVisible] = useState(false);
  const {forumSortOrder, setForumSortOrder} = useFilter();
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

  const handleFilterSelection = (filter: ForumSortOrder) => {
    if (filter === forumSortOrder) {
      setForumSortOrder(undefined);
    } else {
      setForumSortOrder(filter);
    }
    closeMenu();
  };

  return (
    <Menu visible={visible} onDismiss={closeMenu} anchor={menuAnchor}>
      <Menu.Item
        title={'Event Time'}
        leadingIcon={AppIcons.events}
        onPress={() => handleFilterSelection(ForumSortOrder.event)}
        style={forumSortOrder === ForumSortOrder.event ? commonStyles.surfaceVariant : undefined}
        trailingIcon={forumSortOrder === ForumSortOrder.event ? AppIcons.check : undefined}
      />
      <Menu.Item
        title={'Most Recent Post'}
        leadingIcon={AppIcons.recent}
        onPress={() => handleFilterSelection(ForumSortOrder.update)}
        style={forumSortOrder === ForumSortOrder.update ? commonStyles.surfaceVariant : undefined}
        trailingIcon={forumSortOrder === ForumSortOrder.update ? AppIcons.check : undefined}
      />
      <Menu.Item
        title={'Creation Time'}
        leadingIcon={AppIcons.new}
        onPress={() => handleFilterSelection(ForumSortOrder.create)}
        style={forumSortOrder === ForumSortOrder.create ? commonStyles.surfaceVariant : undefined}
        trailingIcon={forumSortOrder === ForumSortOrder.create ? AppIcons.check : undefined}
      />
      <Menu.Item
        title={'Title'}
        leadingIcon={AppIcons.text}
        onPress={() => handleFilterSelection(ForumSortOrder.title)}
        style={forumSortOrder === ForumSortOrder.title ? commonStyles.surfaceVariant : undefined}
        trailingIcon={forumSortOrder === ForumSortOrder.title ? AppIcons.check : undefined}
      />
      <Divider bold={true} />
      <Menu.Item title={'Ascending'} leadingIcon={AppIcons.sortAscending} />
      <Menu.Item title={'Descending'} leadingIcon={AppIcons.sortDescending} />
    </Menu>
  );
};
