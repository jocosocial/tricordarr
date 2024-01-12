import React, {useState} from 'react';
import {Menu} from 'react-native-paper';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {Item} from 'react-navigation-header-buttons';
import {ForumFilter} from '../../../libraries/Enums/ForumSortFilter';
import {useFilter} from '../../Context/Contexts/FilterContext';
import {ViewStyle} from 'react-native';
import {useAppTheme} from '../../../styles/Theme';

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

  const activeStyle: ViewStyle = {backgroundColor: theme.colors.surfaceVariant};

  return (
    <Menu visible={visible} onDismiss={closeMenu} anchor={menuAnchor}>
      <Menu.Item
        title={'Favorites'}
        leadingIcon={AppIcons.favorite}
        onPress={() => handleFilterSelection(ForumFilter.favorite)}
        style={forumFilter === ForumFilter.favorite ? activeStyle : undefined}
      />
      <Menu.Item
        title={'Your Forums'}
        leadingIcon={AppIcons.user}
        onPress={() => handleFilterSelection(ForumFilter.owned)}
        style={forumFilter === ForumFilter.owned ? activeStyle : undefined}
      />
      <Menu.Item
        title={'Muted'}
        leadingIcon={AppIcons.mute}
        onPress={() => handleFilterSelection(ForumFilter.mute)}
        style={forumFilter === ForumFilter.mute ? activeStyle : undefined}
      />
      <Menu.Item
        title={'Unread'}
        leadingIcon={AppIcons.forumUnread}
        onPress={() => handleFilterSelection(ForumFilter.unread)}
        style={forumFilter === ForumFilter.unread ? activeStyle : undefined}
      />
    </Menu>
  );
};
