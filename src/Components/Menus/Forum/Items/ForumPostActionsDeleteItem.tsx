import React from 'react';
import {Menu} from 'react-native-paper';

import {AppIcons} from '#src/Enums/Icons';
import {useForumCacheReducer} from '#src/Hooks/Forum/useForumCacheReducer';
import {alertDeletePost} from '#src/Libraries/Alerts/ForumAlerts';
import {useForumPostDeleteMutation} from '#src/Queries/Forum/ForumPostMutations';
import {ForumData, PostData} from '#src/Structs/ControllerStructs';

interface ForumPostActionsDeleteItemProps {
  forumPost: PostData;
  closeMenu: () => void;
  forumData?: ForumData;
}

export const ForumPostActionsDeleteItem = ({forumPost, closeMenu, forumData}: ForumPostActionsDeleteItemProps) => {
  const deleteMutation = useForumPostDeleteMutation();
  const {deletePost} = useForumCacheReducer();

  const onPress = () => {
    alertDeletePost(() => {
      deleteMutation.mutate(
        {
          postID: forumPost.postID.toString(),
        },
        {
          onSuccess: () => {
            deletePost(forumPost.postID, forumData?.forumID, forumData?.categoryID);
          },
          onSettled: closeMenu,
        },
      );
    }, closeMenu);
  };

  return <Menu.Item dense={false} leadingIcon={AppIcons.postRemove} title={'Delete'} onPress={onPress} />;
};
