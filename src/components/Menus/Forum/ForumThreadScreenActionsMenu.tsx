import * as React from 'react';
import {Divider, Menu} from 'react-native-paper';
import {
  BottomTabComponents,
  ForumStackComponents,
  MainStackComponents,
  RootStackComponents,
} from '../../../libraries/Enums/Navigation';
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
import {useForumStackNavigation} from '../../Navigation/Stacks/ForumStackNavigator';
import {PostAsModeratorMenuItem} from '../Items/PostAsModeratorMenuItem';
import {PostAsTwitarrTeamMenuItem} from '../Items/PostAsTwitarrTeamMenuItem';

interface ForumThreadActionsMenuProps {
  forumData: ForumData;
}

const helpContent = ['Click/tap on a post to favorite, edit, or add a reaction.'];

export const ForumThreadScreenActionsMenu = ({forumData}: ForumThreadActionsMenuProps) => {
  const [visible, setVisible] = React.useState(false);
  const {setModalContent, setModalVisible} = useModal();
  const {hasModerator, setAsModerator, setAsTwitarrTeam, hasTwitarrTeam, asTwitarrTeam, asModerator} = usePrivilege();
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
      {forumData.creator.userID === profilePublicData?.header.userID && (
        <>
          <Menu.Item
            dense={false}
            title={'Edit'}
            leadingIcon={AppIcons.forumEdit}
            onPress={() => {
              closeMenu();
              forumStackNavigation.push(ForumStackComponents.forumThreadEditScreen, {
                forumData: forumData,
              });
            }}
          />
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
      {hasTwitarrTeam && (
        <>
          <PostAsTwitarrTeamMenuItem closeMenu={closeMenu} />
          <Divider bold={true} />
        </>
      )}
      {hasModerator && (
        <>
          <PostAsModeratorMenuItem closeMenu={closeMenu} />
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
