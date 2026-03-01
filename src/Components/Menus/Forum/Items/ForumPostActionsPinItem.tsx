import React from 'react';
import {Menu} from 'react-native-paper';

import {StateLoadingIcon} from '#src/Components/Icons/StateLoadingIcon';
import {AppIcons} from '#src/Enums/Icons';
import {useForumCacheReducer} from '#src/Hooks/Forum/useForumCacheReducer';
import {useForumPostPinMutation} from '#src/Queries/Forum/ForumPostPinMutations';
import {ForumData, PostData} from '#src/Structs/ControllerStructs';

interface ForumPostActionsPinItemProps {
  forumPost: PostData;
  forumData?: ForumData;
  closeMenu: () => void;
}

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

  const getIcon = () => (
    <StateLoadingIcon
      isLoading={pinMutation.isPending}
      state={props.forumPost.isPinned}
      iconTrue={AppIcons.unpin}
      iconFalse={AppIcons.pin}
    />
  );

  return (
    <Menu.Item
      title={props.forumPost.isPinned ? 'Unpin' : 'Pin Post to Thread'}
      dense={false}
      leadingIcon={getIcon}
      onPress={handleFavorite}
    />
  );
};
