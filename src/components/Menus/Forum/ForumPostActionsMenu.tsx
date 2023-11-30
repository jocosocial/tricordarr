import React, {ReactNode} from 'react';
import {PostData} from '../../../libraries/Structs/ControllerStructs';
import {Divider, Menu} from 'react-native-paper';
import {AppIcons} from '../../../libraries/Enums/Icons';
import Clipboard from '@react-native-clipboard/clipboard';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {ForumPostActionsFavoriteItem} from './Items/ForumPostActionsFavoriteItem';
import {ForumPostActionsReactionItem} from './Items/ForumPostActionsReactionItem';
import {ForumPostActionsReportItem} from './Items/ForumPostActionsReportItem';
import {ForumPostActionsModerateItem} from './Items/ForumPostActionsModerateItem';
import {ForumPostActionsDeleteItem} from './Items/ForumPostActionsDeleteItem';
import {ForumPostActionsShowThreadItem} from './Items/ForumPostActionsShowThreadItem';
import {useRootStack} from '../../Navigation/Stacks/RootStackNavigator';
import {useForumStackNavigation} from '../../Navigation/Stacks/ForumStackNavigator';
import {ForumStackComponents} from '../../../libraries/Enums/Navigation';

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
  const {profilePublicData} = useUserData();
  const bySelf = profilePublicData?.header.userID === forumPost.author.userID;
  // Apparently this doesn't get to be available in the sub items? That's annoying.
  const rootNavigation = useRootStack();
  const forumNavigation = useForumStackNavigation();

  return (
    <Menu visible={visible} onDismiss={closeMenu} anchor={anchor}>
      {enableShowInThread && (
        <>
          <ForumPostActionsShowThreadItem forumPost={forumPost} closeMenu={closeMenu} rootNavigation={rootNavigation} />
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
        <Menu.Item
          dense={false}
          leadingIcon={AppIcons.postEdit}
          title={'Edit'}
          onPress={() => {
            closeMenu();
            forumNavigation.push(ForumStackComponents.forumPostEditScreen, {
              postData: forumPost,
            });
          }}
        />
      )}
      <ForumPostActionsDeleteItem forumPost={forumPost} closeMenu={closeMenu} />
      <Divider bold={true} />
      <ForumPostActionsFavoriteItem forumPost={forumPost} />
      <ForumPostActionsReportItem forumPost={forumPost} closeMenu={closeMenu} />
      <ForumPostActionsModerateItem forumPost={forumPost} closeMenu={closeMenu} rootNavigation={rootNavigation} />
      <Divider bold={true} />
      <ForumPostActionsReactionItem forumPost={forumPost} />
    </Menu>
  );
};
