import React from 'react';
import {Item} from 'react-navigation-header-buttons';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {Menu} from 'react-native-paper';
import {ReloadMenuItem} from '../Items/ReloadMenuItem';
import {HelpMenuItem} from '../Items/HelpMenuItem';

export const forumPostHelpText = [
  'Long-press a post to favorite, edit, or add a reaction.',
  'Tapping on a post will take you to the posts forum to see it in context.',
  'Favoriting a post will save it to an easily accessible Personal Category on the Forums page.',
  'You can edit or delete your own forum posts.',
];

interface ForumPostScreenBaseActionsMenuProps {
  onReload: () => void;
}

export const ForumPostScreenBaseActionsMenu = (props: ForumPostScreenBaseActionsMenuProps) => {
  const [visible, setVisible] = React.useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  return (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      anchor={<Item title={'Actions'} iconName={AppIcons.menu} onPress={openMenu} />}>
      <ReloadMenuItem closeMenu={closeMenu} onReload={props.onReload} />
      <HelpMenuItem closeMenu={closeMenu} helpContent={forumPostHelpText} />
    </Menu>
  );
};
