import {useQueryClient} from '@tanstack/react-query';
import React from 'react';
import {Menu} from 'react-native-paper';

import {StateLoadingIcon} from '#src/Components/Icons/StateLoadingIcon';
import {AppIcons} from '#src/Enums/Icons';
import {useForumPostBookmarkMutation} from '#src/Queries/Forum/ForumPostBookmarkMutations';
import {ForumData, PostData} from '#src/Structs/ControllerStructs';

interface ForumPostActionsFavoriteItemProps {
  forumPost: PostData;
  forumData?: ForumData;
  // For some reason, closeMenu through the hook is not available.
  closeMenu: () => void;
}

export const ForumPostActionsFavoriteItem = ({forumPost, forumData, closeMenu}: ForumPostActionsFavoriteItemProps) => {
  const favoriteMutation = useForumPostBookmarkMutation();
  const queryClient = useQueryClient();

  const handleFavorite = () => {
    favoriteMutation.mutate(
      {
        postID: forumPost.postID.toString(),
        action: forumPost.isBookmarked ? 'delete' : 'create',
      },
      {
        onSuccess: async () => {
          closeMenu();
          await Promise.all([
            queryClient.invalidateQueries({queryKey: [`/forum/post/${forumPost.postID}`]}),
            queryClient.invalidateQueries({queryKey: ['/forum/post/search']}),
            queryClient.invalidateQueries({queryKey: [`/forum/post/${forumPost.postID}/forum`]}),
          ]);
          if (forumData) {
            await Promise.all([
              queryClient.invalidateQueries({queryKey: [`/forum/${forumData.forumID}`]}),
              queryClient.invalidateQueries({queryKey: [`/forum/${forumData.forumID}/pinnedposts`]}),
            ]);
          }
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
