import * as React from 'react';
import {Divider, Menu} from 'react-native-paper';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {HelpModalView} from '../../Views/Modals/HelpModalView';
import {useModal} from '../../Context/Contexts/ModalContext';
import {Item} from 'react-navigation-header-buttons';
import {ReactNode} from 'react';
import {CommonStackComponents, useCommonStack} from '../../Navigation/CommonScreens';

const helpContent = [
  'Forum Categories are broad containers for forum threads. There are two groupings of forum categories: Forum (for general topics, announcements, memes, etc) and Personal (for forums that relate specifically to you.)',
  'You can set up alert words to ping you when someone makes a forum post containing a specific word.',
  'You can set up mute words to prevent seeing forum posts containing a specific word.',
  'You can search for forum threads or forum posts using the appropriate action in the floating action button at the bottom of the screen.'
];

export const ForumCategoriesScreenActionsMenu = () => {
  const [visible, setVisible] = React.useState(false);
  const {setModalContent, setModalVisible} = useModal();
  const commonNavigation = useCommonStack();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleModal = (content: ReactNode) => {
    closeMenu();
    setModalContent(content);
    setModalVisible(true);
  };

  return (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      anchor={<Item title={'Actions'} iconName={AppIcons.menu} onPress={openMenu} />}>
      <Menu.Item
        dense={false}
        title={'Alert Keywords'}
        leadingIcon={AppIcons.alertword}
        onPress={() => {
          closeMenu();
          commonNavigation.push(CommonStackComponents.alertKeywords)
        }}
      />
      <Menu.Item
        dense={false}
        title={'Mute Keywords'}
        leadingIcon={AppIcons.mute}
        onPress={() => {
          closeMenu();
          commonNavigation.push(CommonStackComponents.muteKeywords)
        }}
      />
      <Divider bold={true} />
      <Menu.Item
        leadingIcon={AppIcons.help}
        title={'Help'}
        onPress={() => {
          closeMenu();
          setModalContent(<HelpModalView text={helpContent} />);
          setModalVisible(true);
        }}
      />
    </Menu>
  );
};
