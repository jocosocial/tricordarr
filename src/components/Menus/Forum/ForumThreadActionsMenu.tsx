import * as React from 'react';
import {Divider, Menu} from 'react-native-paper';
import {BottomTabComponents, MainStackComponents, RootStackComponents} from '../../../libraries/Enums/Navigation';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {HelpModalView} from '../../Views/Modals/HelpModalView';
import {useModal} from '../../Context/Contexts/ModalContext';
import {ForumData} from '../../../libraries/Structs/ControllerStructs';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {Item} from 'react-navigation-header-buttons';
import {useRootStack} from '../../Navigation/Stacks/RootStackNavigator';
import {ReportModalView} from '../../Views/Modals/ReportModalView';
import {ReactNode} from 'react';

interface ForumThreadActionsMenuProps {
  forumData: ForumData;
}

const helpContent = ['Click/tap on a post to favorite, edit, or add a reaction.'];

export const ForumThreadActionsMenu = ({forumData}: ForumThreadActionsMenuProps) => {
  const [visible, setVisible] = React.useState(false);
  const {setModalContent, setModalVisible} = useModal();
  const {hasModerator} = usePrivilege();
  const {profilePublicData} = useUserData();
  const rootStackNavigation = useRootStack();

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
      {forumData.creator.userID === profilePublicData?.header.userID && (
        <>
          <Menu.Item dense={false} title={'Edit'} leadingIcon={AppIcons.forumEdit} />
          <Divider bold={true} />
        </>
      )}
      {forumData?.creator.username !== profilePublicData?.header.username && (
        <>
          <Menu.Item
            dense={false}
            leadingIcon={AppIcons.report}
            title={'Report'}
            onPress={() => handleModal(<ReportModalView forum={forumData} />)}
          />
          <Divider bold={true} />
        </>
      )}
      {hasModerator && (
        <>
          <Menu.Item
            dense={false}
            leadingIcon={AppIcons.moderator}
            title={'Moderate'}
            onPress={() => {
              rootStackNavigation.push(RootStackComponents.rootContentScreen, {
                screen: BottomTabComponents.homeTab,
                params: {
                  screen: MainStackComponents.siteUIScreen,
                  params: {
                    resource: 'forum',
                    id: forumData.forumID,
                    moderate: true,
                  },
                  initial: false,
                },
              });
              closeMenu();
            }}
          />
          <Divider bold={true} />
        </>
      )}
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