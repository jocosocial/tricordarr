import React, {useState} from 'react';
import {Menu} from 'react-native-paper';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {Item} from 'react-navigation-header-buttons';
import {ForumFilter} from '../../../libraries/Enums/ForumSortFilter';
import {useFilter} from '../../Context/Contexts/FilterContext';
import {useAppTheme} from '../../../styles/Theme';
import {useStyles} from '../../Context/Contexts/StyleContext';

export const ForumThreadScreenFilterMenu = () => {
  const [visible, setVisible] = useState(false);
  const {forumFilter, setForumFilter} = useFilter();
  const theme = useAppTheme();
  const {commonStyles} = useStyles();

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
      <Menu.Item
        title={'Favorites'}
        leadingIcon={AppIcons.favorite}
        onPress={() => handleFilterSelection(ForumFilter.favorite)}
        style={forumFilter === ForumFilter.favorite ? commonStyles.surfaceVariant : undefined}
        trailingIcon={forumFilter === ForumFilter.favorite ? AppIcons.check : undefined}
      />
      <Menu.Item
        title={'Your Forums'}
        leadingIcon={AppIcons.user}
        onPress={() => handleFilterSelection(ForumFilter.owned)}
        style={forumFilter === ForumFilter.owned ? commonStyles.surfaceVariant : undefined}
        trailingIcon={forumFilter === ForumFilter.owned ? AppIcons.check : undefined}
      />
      <Menu.Item
        title={'Muted'}
        leadingIcon={AppIcons.mute}
        onPress={() => handleFilterSelection(ForumFilter.mute)}
        style={forumFilter === ForumFilter.mute ? commonStyles.surfaceVariant : undefined}
        trailingIcon={forumFilter === ForumFilter.mute ? AppIcons.check : undefined}
      />
      <Menu.Item
        title={'Unread'}
        leadingIcon={AppIcons.forumUnread}
        onPress={() => handleFilterSelection(ForumFilter.unread)}
        style={forumFilter === ForumFilter.unread ? commonStyles.surfaceVariant : undefined}
        trailingIcon={forumFilter === ForumFilter.unread ? AppIcons.check : undefined}
      />
    </Menu>
  );
};
