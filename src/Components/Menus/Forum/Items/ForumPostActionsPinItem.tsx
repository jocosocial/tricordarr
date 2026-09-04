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
  const {updatePostPin} = useForumCacheReducer();

  const handleFavorite = () => {
    pinMutation.mutate(
      {
        postID: props.forumPost.postID.toString(),
        action: props.forumPost.isPinned ? 'unpin' : 'pin',
      },
      {
        onSuccess: () => {
          updatePostPin(props.forumPost.postID, props.forumData?.forumID, !props.forumPost.isPinned);
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
      onPress={handleFavorite}
    />
  );
};
