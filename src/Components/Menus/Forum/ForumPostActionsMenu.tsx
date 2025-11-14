import Clipboard from '@react-native-clipboard/clipboard';
import React, {ReactNode} from 'react';
import {Divider, Menu} from 'react-native-paper';

import {ForumPostActionsDeleteItem} from '#src/Components/Menus/Forum/Items/ForumPostActionsDeleteItem';
import {ForumPostActionsFavoriteItem} from '#src/Components/Menus/Forum/Items/ForumPostActionsFavoriteItem';
import {ForumPostActionsModerateItem} from '#src/Components/Menus/Forum/Items/ForumPostActionsModerateItem';
import {ForumPostActionsPinItem} from '#src/Components/Menus/Forum/Items/ForumPostActionsPinItem';
import {ForumPostActionsReactionItem} from '#src/Components/Menus/Forum/Items/ForumPostActionsReactionItem';
import {ForumPostActionsReportItem} from '#src/Components/Menus/Forum/Items/ForumPostActionsReportItem';
import {ForumPostActionsShowThreadItem} from '#src/Components/Menus/Forum/Items/ForumPostActionsShowThreadItem';
import {ShareMenuItem} from '#src/Components/Menus/Items/ShareMenuItem';
import {AppIcons} from '#src/Enums/Icons';
import {ShareContentType} from '#src/Enums/ShareContentType';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries';
import {ForumData, PostData} from '#src/Structs/ControllerStructs';

interface ForumPostActionsMenuProps {
  visible: boolean;
  closeMenu: () => void;
  anchor: ReactNode;
  forumPost: PostData;
  enableShowInThread?: boolean;
  enablePinnedPosts?: boolean;
  forumData?: ForumData;
}

export const ForumPostActionsMenu = ({
  visible,
  closeMenu,
  anchor,
  forumPost,
  enableShowInThread,
  enablePinnedPosts,
  forumData,
}: ForumPostActionsMenuProps) => {
  const {data: profilePublicData} = useUserProfileQuery();
  const bySelf = profilePublicData?.header.userID === forumPost.author.userID;
  // Apparently this doesn't get to be available in the sub items? That's annoying.
  const commonNavigation = useCommonStack();

  /**
   * For some reason, closeMenu through the hook is not available in the child components
   * for the actions.
   */
  return (
    <Menu visible={visible} onDismiss={closeMenu} anchor={anchor}>
      {enableShowInThread && (
        <>
          <ForumPostActionsShowThreadItem forumPost={forumPost} closeMenu={closeMenu} navigation={commonNavigation} />
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
      <ShareMenuItem contentType={ShareContentType.forumPost} contentID={forumPost.postID} closeMenu={closeMenu} />
      <Divider bold={true} />
      {bySelf && (
        <>
          <Menu.Item
            dense={false}
            leadingIcon={AppIcons.edit}
            title={'Edit'}
            onPress={() => {
              closeMenu();
              commonNavigation.push(CommonStackComponents.forumPostEditScreen, {
                postData: forumPost,
                forumData: forumData,
              });
            }}
          />
          <Divider bold={true} />
        </>
      )}
      <ForumPostActionsDeleteItem forumPost={forumPost} forumData={forumData} closeMenu={closeMenu} />
      <Divider bold={true} />
      <ForumPostActionsFavoriteItem forumPost={forumPost} forumData={forumData} closeMenu={closeMenu} />
      {enablePinnedPosts && (
        <>
          <ForumPostActionsPinItem forumPost={forumPost} forumData={forumData} closeMenu={closeMenu} />
          <Divider bold={true} />
        </>
      )}
      <Divider bold={true} />
      <ForumPostActionsReportItem forumPost={forumPost} closeMenu={closeMenu} />
      <Divider bold={true} />
      <ForumPostActionsModerateItem forumPost={forumPost} closeMenu={closeMenu} navigation={commonNavigation} />
      <Divider bold={true} />
      <ForumPostActionsReactionItem forumPost={forumPost} />
    </Menu>
  );
};
