import React from 'react';
import {Menu} from 'react-native-paper';

import {getStateLoadingIcon} from '#src/Components/Icons/StateLoadingIcon';
import {AppIcons} from '#src/Enums/Icons';
import {useForumCacheReducer} from '#src/Hooks/Forum/useForumCacheReducer';
import {useForumPostBookmarkMutation} from '#src/Queries/Forum/ForumPostBookmarkMutations';
import {ForumData, PostData} from '#src/Structs/ControllerStructs';

interface ForumPostActionsFavoriteItemProps {
  forumPost: PostData;
  forumData?: ForumData;
  closeMenu: () => void;
}

/** Bookmark or unbookmark a forum post from the post actions menu. */
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

  return (
    <Menu.Item
      title={forumPost.isBookmarked ? 'Unfavorite' : 'Favorite'}
      dense={false}
      leadingIcon={getStateLoadingIcon({
        isLoading: favoriteMutation.isPending,
        state: forumPost.isBookmarked,
        iconTrue: AppIcons.unfavorite,
        iconFalse: AppIcons.favorite,
      })}
      // Menus stay open until onSettled closes them, so a mutation in flight is still tappable.
      // Without this a fast double-tap fires the toggle twice and can flip the state back. See #533.
      disabled={favoriteMutation.isPending}
      onPress={handleFavorite}
    />
  );
};
