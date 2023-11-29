import React, {ReactNode} from 'react';
import {useModal} from '../../Context/Contexts/ModalContext';
import {PostData} from '../../../libraries/Structs/ControllerStructs';
import {ReportModalView} from '../../Views/Modals/ReportModalView';
import {Divider, IconButton, Menu} from 'react-native-paper';
import {AppIcons} from '../../../libraries/Enums/Icons';
import Clipboard from '@react-native-clipboard/clipboard';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext';
import {View} from 'react-native';
import {LaughReaction, LoveReaction, LikeReaction} from '../../Text/Reactions';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {BottomTabComponents, MainStackComponents, RootStackComponents} from '../../../libraries/Enums/Navigation';
import {useRootStack} from '../../Navigation/Stacks/RootStackNavigator';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {ForumPostActionsFavoriteItem} from './Items/ForumPostActionsFavoriteItem';
import {LikeType} from '../../../libraries/Enums/LikeType';
import {ForumPostActionsReactionItem} from './Items/ForumPostActionsReactionItem';

interface ForumPostActionsMenuProps {
  visible: boolean;
  closeMenu: () => void;
  anchor: ReactNode;
  forumPost: PostData;
  enableShowInThread?: boolean;
}

export const ForumPostActionsMenu = ({
  visible,
  closeMenu,
  anchor,
  forumPost,
  enableShowInThread,
}: ForumPostActionsMenuProps) => {
  const {setModalContent, setModalVisible} = useModal();
  const {hasModerator} = usePrivilege();
  const {commonStyles} = useStyles();
  const rootStackNavigation = useRootStack();
  const {profilePublicData} = useUserData();
  const bySelf = profilePublicData?.header.userID === forumPost.author.userID;

  const handleReport = () => {
    closeMenu();
    setModalContent(<ReportModalView forumPost={forumPost} />);
    setModalVisible(true);
  };

  return (
    <Menu visible={visible} onDismiss={closeMenu} anchor={anchor}>
      {enableShowInThread && (
        <>
          <Menu.Item dense={false} leadingIcon={AppIcons.forum} title={'View Thread'} onPress={handleReport} />
          <Divider bold={true} />
        </>
      )}
      <Menu.Item
        dense={false}
        leadingIcon={AppIcons.copy}
        title={'Copy'}
        onPress={() => {
          Clipboard.setString(forumPost.text);
          closeMenu();
        }}
      />
      {bySelf && (
        <Menu.Item dense={false} leadingIcon={AppIcons.postEdit} title={'Edit'} onPress={() => console.log('edit')} />
      )}
      {bySelf && (
        <Menu.Item
          dense={false}
          leadingIcon={AppIcons.postRemove}
          title={'Delete'}
          onPress={() => console.log('delete')}
        />
      )}
      <Divider bold={true} />
      <ForumPostActionsFavoriteItem forumPost={forumPost} />
      <Menu.Item title={'Report'} dense={false} leadingIcon={AppIcons.report} onPress={handleReport} />
      {hasModerator && (
        <Menu.Item
          title={'Moderate'}
          dense={false}
          leadingIcon={AppIcons.moderator}
          onPress={() => {
            closeMenu();
            rootStackNavigation.push(RootStackComponents.rootContentScreen, {
              screen: BottomTabComponents.homeTab,
              params: {
                screen: MainStackComponents.siteUIScreen,
                params: {
                  resource: 'forumpost',
                  id: forumPost.postID.toString(),
                  moderate: true,
                },
                initial: false,
              },
            });
          }}
        />
      )}
      <Divider bold={true} />
      <ForumPostActionsReactionItem forumPost={forumPost} />
    </Menu>
  );
};
