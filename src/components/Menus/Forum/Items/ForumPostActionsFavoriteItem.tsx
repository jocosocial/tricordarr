import {Menu} from 'react-native-paper';
import React from 'react';
import {PostData} from '../../../../libraries/Structs/ControllerStructs';
import {useForumPostBookmarkMutation} from '../../../Queries/Forum/ForumPostBookmarkMutations';
import {useTwitarr} from '../../../Context/Contexts/TwitarrContext';
import {ForumPostListActions} from '../../../Reducers/Forum/ForumPostListReducer';
import {StateLoadingIcon} from '../../../Icons/StateLoadingIcon';
import {AppIcons} from '../../../../libraries/Enums/Icons';

interface ForumPostActionsFavoriteItemProps {
  forumPost: PostData;
}

export const ForumPostActionsFavoriteItem = ({forumPost}: ForumPostActionsFavoriteItemProps) => {
  const favoriteMutation = useForumPostBookmarkMutation();
  const {dispatchForumPosts} = useTwitarr();

  const handleFavorite = () => {
    favoriteMutation.mutate(
      {
        postID: forumPost.postID.toString(),
        action: forumPost.isBookmarked ? 'delete' : 'create',
      },
      {
        onSuccess: () => {
          dispatchForumPosts({
            type: ForumPostListActions.updatePost,
            newPost: {
              ...forumPost,
              isBookmarked: !forumPost.isBookmarked,
            },
          });
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
