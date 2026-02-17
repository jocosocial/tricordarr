import React from 'react';
import {Menu} from 'react-native-paper';

import {StateLoadingIcon} from '#src/Components/Icons/StateLoadingIcon';
import {AppIcons} from '#src/Enums/Icons';
import {useForumCacheReducer} from '#src/Hooks/Forum/useForumCacheReducer';
import {useForumPostBookmarkMutation} from '#src/Queries/Forum/ForumPostBookmarkMutations';
import {ForumData, PostData} from '#src/Structs/ControllerStructs';

interface ForumPostActionsFavoriteItemProps {
  forumPost: PostData;
  forumData?: ForumData;
  closeMenu: () => void;
}

export const ForumPostActionsFavoriteItem = ({forumPost, forumData, closeMenu}: ForumPostActionsFavoriteItemProps) => {
  const favoriteMutation = useForumPostBookmarkMutation();
  const {updatePostBookmark} = useForumCacheReducer();

  const handleFavorite = () => {
    favoriteMutation.mutate(
      {
        postID: forumPost.postID.toString(),
        action: forumPost.isBookmarked ? 'delete' : 'create',
      },
      {
        onSuccess: () => {
          updatePostBookmark(forumPost.postID, forumData?.forumID, !forumPost.isBookmarked);
        },
        onSettled: () => {
          closeMenu();
        },
      },
    );
  };

  const getIcon = () => (
    <StateLoadingIcon
      isLoading={favoriteMutation.isPending}
      state={forumPost.isBookmarked}
      iconTrue={AppIcons.unfavorite}
      iconFalse={AppIcons.favorite}
    />
  );

  return (
    <Menu.Item
      title={forumPost.isBookmarked ? 'Unfavorite' : 'Favorite'}
      dense={false}
      leadingIcon={getIcon}
      onPress={handleFavorite}
    />
  );
};
