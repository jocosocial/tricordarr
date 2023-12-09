import React, {useState} from 'react';
import {Menu} from 'react-native-paper';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {Item} from 'react-navigation-header-buttons';
import {ForumSortOrder} from '../../../libraries/Enums/ForumSortFilter';
import {useFilter} from '../../Context/Contexts/FilterContext';
import {ViewStyle} from 'react-native';
import {useAppTheme} from '../../../styles/Theme';

export const ForumThreadScreenSortMenu = () => {
  const [visible, setVisible] = useState(false);
  const {forumSortOrder, setForumSortOrder} = useFilter();
  const theme = useAppTheme();

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

  const activeStyle: ViewStyle = {backgroundColor: theme.colors.surfaceVariant};

  return (
    <Menu visible={visible} onDismiss={closeMenu} anchor={menuAnchor}>
      <Menu.Item
        title={'Event Time'}
        leadingIcon={AppIcons.events}
        onPress={() => handleFilterSelection(ForumSortOrder.event)}
        style={forumSortOrder === ForumSortOrder.event ? activeStyle : undefined}
      />
      <Menu.Item
        title={'Most Recent Post'}
        leadingIcon={AppIcons.recent}
        onPress={() => handleFilterSelection(ForumSortOrder.update)}
        style={forumSortOrder === ForumSortOrder.update ? activeStyle : undefined}
      />
      <Menu.Item
        title={'Creation Time'}
        leadingIcon={AppIcons.new}
        onPress={() => handleFilterSelection(ForumSortOrder.create)}
        style={forumSortOrder === ForumSortOrder.create ? activeStyle : undefined}
      />
      <Menu.Item
        title={'Title'}
        leadingIcon={AppIcons.text}
        onPress={() => handleFilterSelection(ForumSortOrder.title)}
        style={forumSortOrder === ForumSortOrder.title ? activeStyle : undefined}
      />
    </Menu>
  );
};
