import React from 'react';
import {Menu} from 'react-native-paper';

import {getStateLoadingIcon} from '#src/Components/Icons/StateLoadingIcon';
import {AppIcons} from '#src/Enums/Icons';
import {useForumCacheReducer} from '#src/Hooks/Forum/useForumCacheReducer';
import {useForumPostPinMutation} from '#src/Queries/Forum/ForumPostPinMutations';
import {ForumData, PostData} from '#src/Structs/ControllerStructs';

interface ForumPostActionsPinItemProps {
  forumPost: PostData;
  forumData?: ForumData;
  closeMenu: () => void;
}

/** Moderator action to pin or unpin a post within its thread. */
export const ForumPostActionsPinItem = (props: ForumPostActionsPinItemProps) => {
  const pinMutation = useForumPostPinMutation();
  const {updatePostPin, invalidateForum} = useForumCacheReducer();

  const handleFavorite = () => {
    const newValue = !props.forumPost.isPinned;
    // Optimistic: flip the cache immediately so the icon is already correct by the time the
    // spinner clears, instead of waiting on a (possibly slow) network round trip to do it.
    updatePostPin(props.forumPost.postID, props.forumData?.forumID, newValue);
    pinMutation.mutate(
      {
        postID: props.forumPost.postID.toString(),
        action: newValue ? 'pin' : 'unpin',
      },
      {
        onError: () => {
          updatePostPin(props.forumPost.postID, props.forumData?.forumID, !newValue);
          invalidateForum(props.forumData?.forumID);
        },
        onSettled: () => {
          props.closeMenu();
        },
      },
    );
  };

  return (
    <Menu.Item
      title={props.forumPost.isPinned ? 'Unpin' : 'Pin Post to Thread'}
      dense={false}
      leadingIcon={getStateLoadingIcon({
        isLoading: pinMutation.isPending,
        state: props.forumPost.isPinned,
        iconTrue: AppIcons.unpin,
        iconFalse: AppIcons.pin,
      })}
      // Menus stay open until onSettled closes them, so a mutation in flight is still tappable.
      // Without this a fast double-tap fires the toggle twice and can flip the state back. See #533.
      disabled={pinMutation.isPending}
      onPress={handleFavorite}
    />
  );
};
