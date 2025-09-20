import {Menu} from 'react-native-paper';
import React from 'react';
import {ForumData, PostData} from '#src/Libraries/Structs/ControllerStructs.tsx';
import {useForumPostBookmarkMutation} from '#src/Components/Queries/Forum/ForumPostBookmarkMutations.ts';
import {StateLoadingIcon} from '#src/Components/Icons/StateLoadingIcon.tsx';
import {AppIcons} from '#src/Libraries/Enums/Icons.ts';
import {useQueryClient} from '@tanstack/react-query';

interface ForumPostActionsFavoriteItemProps {
  forumPost: PostData;
  forumData?: ForumData;
}

export const ForumPostActionsFavoriteItem = ({forumPost, forumData}: ForumPostActionsFavoriteItemProps) => {
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
          await Promise.all([
            queryClient.invalidateQueries([`/forum/post/${forumPost.postID}`]),
            queryClient.invalidateQueries(['/forum/post/search']),
            queryClient.invalidateQueries([`/forum/post/${forumPost.postID}/forum`]),
          ]);
          if (forumData) {
            await Promise.all([
              queryClient.invalidateQueries([`/forum/${forumData.forumID}`]),
              queryClient.invalidateQueries([`/forum/${forumData.forumID}/pinnedposts`]),
            ]);
          }
        },
      },
    );
  };

  const getIcon = () => (
    <StateLoadingIcon
      isLoading={favoriteMutation.isLoading}
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
