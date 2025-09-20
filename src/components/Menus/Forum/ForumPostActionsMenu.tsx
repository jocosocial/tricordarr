import React, {ReactNode} from 'react';
import {ForumData, PostData} from '#src/Libraries/Structs/ControllerStructs.tsx';
import {Divider, Menu} from 'react-native-paper';
import {AppIcons} from '#src/Libraries/Enums/Icons.ts';
import Clipboard from '@react-native-clipboard/clipboard';
import {ForumPostActionsFavoriteItem} from './Items/ForumPostActionsFavoriteItem.tsx';
import {ForumPostActionsReactionItem} from './Items/ForumPostActionsReactionItem.tsx';
import {ForumPostActionsReportItem} from './Items/ForumPostActionsReportItem.tsx';
import {ForumPostActionsModerateItem} from './Items/ForumPostActionsModerateItem.tsx';
import {ForumPostActionsDeleteItem} from './Items/ForumPostActionsDeleteItem.tsx';
import {ForumPostActionsShowThreadItem} from './Items/ForumPostActionsShowThreadItem.tsx';
import {ForumPostActionsPinItem} from './Items/ForumPostActionsPinItem.tsx';
import {CommonStackComponents, useCommonStack} from '#src/Components/Navigation/CommonScreens.tsx';
import {useUserProfileQuery} from '#src/Components/Queries/User/UserQueries.ts';

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
      <ForumPostActionsFavoriteItem forumPost={forumPost} forumData={forumData} />
      {enablePinnedPosts && (
        <>
          <ForumPostActionsPinItem forumPost={forumPost} forumData={forumData} />
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
