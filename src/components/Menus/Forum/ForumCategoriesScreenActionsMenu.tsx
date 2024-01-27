import * as React from 'react';
import {Divider, Menu} from 'react-native-paper';
import {
  BottomTabComponents,
  ForumStackComponents,
  MainStackComponents,
  SettingsStackScreenComponents,
} from '../../../libraries/Enums/Navigation';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {HelpModalView} from '../../Views/Modals/HelpModalView';
import {useModal} from '../../Context/Contexts/ModalContext';
import {ForumData} from '../../../libraries/Structs/ControllerStructs';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import {RootStackComponents, useRootStack} from '../../Navigation/Stacks/RootStackNavigator';
import {ReportModalView} from '../../Views/Modals/ReportModalView';
import {ReactNode} from 'react';
import {useForumStackNavigation} from '../../Navigation/Stacks/ForumStackNavigator';
import {PostAsModeratorMenuItem} from '../Items/PostAsModeratorMenuItem';
import {PostAsTwitarrTeamMenuItem} from '../Items/PostAsTwitarrTeamMenuItem';
import {MaterialHeaderButton} from '../../Buttons/MaterialHeaderButton';

const helpContent = [
  'Forum Categories are broad containers for forum threads. There are two groupings of forum categories: Forum (for general topics, announcements, memes, etc) and Personal (for forums that relate specifically to you.)',
  'You can set up alert words to ping you when someone makes a forum post containing a specific word.',
  'You can set up mute words to prevent seeing forum posts containing a specific word.',
  'You can search for forum threads or forum posts using the appropriate action in the floating action button at the bottom of the screen.'
];

export const ForumCategoriesScreenActionsMenu = () => {
  const [visible, setVisible] = React.useState(false);
  const {setModalContent, setModalVisible} = useModal();
  const {profilePublicData} = useUserData();
  const rootStackNavigation = useRootStack();
  const forumStackNavigation = useForumStackNavigation();

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
          rootStackNavigation.push(RootStackComponents.rootContentScreen, {
            screen: BottomTabComponents.homeTab,
            params: {
              screen: MainStackComponents.mainSettingsScreen,
              initial: false,
              params: {
                screen: SettingsStackScreenComponents.alertKeywords,
              },
            },
          });
        }}
      />
      <Menu.Item
        dense={false}
        title={'Mute Keywords'}
        leadingIcon={AppIcons.mute}
        onPress={() => {
          closeMenu();
          rootStackNavigation.push(RootStackComponents.rootContentScreen, {
            screen: BottomTabComponents.homeTab,
            params: {
              screen: MainStackComponents.mainSettingsScreen,
              initial: false,
              params: {
                screen: SettingsStackScreenComponents.muteKeywords,
              },
            },
          });
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
