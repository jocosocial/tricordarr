import React, {ReactNode, useMemo} from 'react';
import {Divider, Menu} from 'react-native-paper';

import {ForumPostActionsDeleteItem} from '#src/Components/Menus/Forum/Items/ForumPostActionsDeleteItem';
import {ForumPostActionsFavoriteItem} from '#src/Components/Menus/Forum/Items/ForumPostActionsFavoriteItem';
import {ForumPostActionsModerateItem} from '#src/Components/Menus/Forum/Items/ForumPostActionsModerateItem';
import {ForumPostActionsPinItem} from '#src/Components/Menus/Forum/Items/ForumPostActionsPinItem';
import {ForumPostActionsReplyItem} from '#src/Components/Menus/Forum/Items/ForumPostActionsReplyItem';
import {ForumPostActionsReportItem} from '#src/Components/Menus/Forum/Items/ForumPostActionsReportItem';
import {ForumPostActionsShowThreadItem} from '#src/Components/Menus/Forum/Items/ForumPostActionsShowThreadItem';
import {ReactionMenuItem} from '#src/Components/Menus/Items/ReactionMenuItem';
import {ShareMenuItem} from '#src/Components/Menus/Items/ShareMenuItem';
import {MenuContextBridge, useMenuContextBridge} from '#src/Components/Menus/MenuContextBridge';
import {PostReactionPicker} from '#src/Components/Reactions/PostReactionPicker';
import {useForumComposer} from '#src/Context/Contexts/ForumComposerContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {AppIcons} from '#src/Enums/Icons';
import {useClipboard} from '#src/Hooks/useClipboard';
import {useLazyVisibility} from '#src/Hooks/useLazyVisibility';
import {canReactTo, ReactionTarget} from '#src/Libraries/Reactions/ReactionActions';
import {ShareContentType} from '#src/Libraries/Sharing';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';
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
  const {currentUserID} = useSession();
  const bridged = useMenuContextBridge();
  const bySelf = currentUserID === forumPost.author.userID;
  const picker = useLazyVisibility();
  const reactionTarget = useMemo<ReactionTarget>(
    () => ({kind: 'forumPost', post: forumPost, forumID: forumData?.forumID}),
    [forumData?.forumID, forumPost],
  );
  const commonNavigation = useCommonStack();
  const {setString} = useClipboard();
  // Undefined outside a thread composer. Replying to yourself would tag yourself, and Swiftarr
  // drops self-mentions (`userDidntMentionSelf` in ForumController), so there is nothing to gain.
  const composer = useForumComposer();
  const showReply = !!composer && !bySelf;

  /**
   * closeMenu comes from the instance established in MessageView so we need to drill
   * that through.
   */
  return (
    <>
      <Menu visible={visible} onDismiss={closeMenu} anchor={anchor}>
        <MenuContextBridge bridged={bridged}>
          {(showReply || enableShowInThread) && (
            <>
              {showReply && <ForumPostActionsReplyItem forumPost={forumPost} closeMenu={closeMenu} />}
              {enableShowInThread && <ForumPostActionsShowThreadItem forumPost={forumPost} closeMenu={closeMenu} />}
              <Divider bold={true} />
            </>
          )}
          <Menu.Item
            dense={false}
            leadingIcon={AppIcons.copy}
            title={'Copy'}
            onPress={() => {
              setString(forumPost.text);
              closeMenu();
            }}
          />
          <ShareMenuItem
            contentType={ShareContentType.forumPost}
            contentID={forumPost.postID}
            contentText={forumPost.text}
            closeMenu={closeMenu}
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
                    forumID: forumData?.forumID,
                  });
                }}
              />
              <ForumPostActionsDeleteItem forumPost={forumPost} forumData={forumData} closeMenu={closeMenu} />
            </>
          )}
          <Divider bold={true} />
          <ForumPostActionsFavoriteItem forumPost={forumPost} forumData={forumData} closeMenu={closeMenu} />
          {enablePinnedPosts && (
            <ForumPostActionsPinItem forumPost={forumPost} forumData={forumData} closeMenu={closeMenu} />
          )}
          <Divider bold={true} />
          <ForumPostActionsReportItem forumPost={forumPost} closeMenu={closeMenu} />
          <Divider bold={true} />
          <ForumPostActionsModerateItem forumPost={forumPost} closeMenu={closeMenu} />
          <Divider bold={true} />
          <ReactionMenuItem
            disabled={!canReactTo(reactionTarget, currentUserID)}
            onPress={() => {
              closeMenu();
              picker.show();
            }}
          />
        </MenuContextBridge>
      </Menu>
      {picker.mounted && <PostReactionPicker target={reactionTarget} open={picker.visible} onClose={picker.hide} />}
    </>
  );
};
