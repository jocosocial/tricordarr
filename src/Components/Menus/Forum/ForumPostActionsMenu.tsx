import React, {ReactNode, useState} from 'react';
import {Divider, Menu} from 'react-native-paper';

import {ForumPostActionsDeleteItem} from '#src/Components/Menus/Forum/Items/ForumPostActionsDeleteItem';
import {ForumPostActionsFavoriteItem} from '#src/Components/Menus/Forum/Items/ForumPostActionsFavoriteItem';
import {ForumPostActionsModerateItem} from '#src/Components/Menus/Forum/Items/ForumPostActionsModerateItem';
import {ForumPostActionsPinItem} from '#src/Components/Menus/Forum/Items/ForumPostActionsPinItem';
import {ForumPostActionsReactionItem} from '#src/Components/Menus/Forum/Items/ForumPostActionsReactionItem';
import {ForumPostActionsReplyItem} from '#src/Components/Menus/Forum/Items/ForumPostActionsReplyItem';
import {ForumPostActionsReportItem} from '#src/Components/Menus/Forum/Items/ForumPostActionsReportItem';
import {ForumPostActionsShowThreadItem} from '#src/Components/Menus/Forum/Items/ForumPostActionsShowThreadItem';
import {ShareMenuItem} from '#src/Components/Menus/Items/ShareMenuItem';
import {EmojiPickerModal} from '#src/Components/Reactions/EmojiPickerModal';
import {useForumComposer} from '#src/Context/Contexts/ForumComposerContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {AppIcons} from '#src/Enums/Icons';
import {useForumCacheReducer} from '#src/Hooks/Forum/useForumCacheReducer';
import {useClipboard} from '#src/Hooks/useClipboard';
import {ShareContentType} from '#src/Libraries/Sharing';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useForumPostReactionMutation} from '#src/Queries/Forum/ForumPostReactionMutations';
import {ForumData, PostData, ReactionData} from '#src/Structs/ControllerStructs';

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
  const bySelf = currentUserID === forumPost.author.userID;
  const reactionMutation = useForumPostReactionMutation();
  const {updatePostReactions} = useForumCacheReducer();
  const [pickerOpen, setPickerOpen] = useState(false);
  // Apparently this doesn't get to be available in the sub items? That's annoying.
  const commonNavigation = useCommonStack();
  const {setString} = useClipboard();
  // Undefined outside a thread composer. Same portal caveat as the navigation above, so
  // read it here and pass the callback down.
  const composer = useForumComposer();
  // Replying to yourself would tag yourself, and Swiftarr drops self-mentions
  // (`userDidntMentionSelf` in ForumController), so there is nothing to gain.
  const onReply = composer && !bySelf ? composer.mentionUser : undefined;

  /** Adds or removes the selected reaction and applies the returned post to every forum cache. */
  const handleReaction = (reaction: string) => {
    if (!currentUserID) {
      return;
    }
    const action = ReactionData.hasUserReacted(forumPost.reactions ?? [], currentUserID, reaction)
      ? 'delete'
      : 'create';
    reactionMutation.mutate(
      {postID: forumPost.postID.toString(), reaction, action},
      {onSuccess: response => updatePostReactions(response.data, forumData?.forumID)},
    );
  };

  /**
   * closeMenu comes from the instance established in MessageView so we need to drill
   * that through.
   */
  return (
    <>
      <Menu visible={visible} onDismiss={closeMenu} anchor={anchor}>
        {(onReply || enableShowInThread) && (
          <>
            {onReply && <ForumPostActionsReplyItem forumPost={forumPost} closeMenu={closeMenu} onReply={onReply} />}
            {enableShowInThread && (
              <ForumPostActionsShowThreadItem
                forumPost={forumPost}
                closeMenu={closeMenu}
                navigation={commonNavigation}
              />
            )}
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
        <ForumPostActionsReportItem forumPost={forumPost} closeMenu={closeMenu} navigation={commonNavigation} />
        <Divider bold={true} />
        <ForumPostActionsModerateItem forumPost={forumPost} closeMenu={closeMenu} navigation={commonNavigation} />
        <Divider bold={true} />
        <ForumPostActionsReactionItem
          disabled={bySelf || reactionMutation.isPending}
          onPress={() => {
            closeMenu();
            setPickerOpen(true);
          }}
        />
      </Menu>
      <EmojiPickerModal open={pickerOpen} onClose={() => setPickerOpen(false)} onEmojiSelected={handleReaction} />
    </>
  );
};
