import {AppIcons} from '../../../../libraries/Enums/Icons';
import {ActivityIndicator, Menu} from 'react-native-paper';
import React from 'react';
import {PostData} from '../../../../libraries/Structs/ControllerStructs';
import {useForumPostBookmarkMutation} from '../../../Queries/Forum/ForumPostBookmarkQueries';
import {useTwitarr} from '../../../Context/Contexts/TwitarrContext';
import {ForumPostListActions} from '../../../Reducers/Forum/ForumPostListReducer';
import {AppIcon} from '../../../Icons/AppIcon';
import {useAppTheme} from '../../../../styles/Theme';
import {FavoriteIcon} from '../../../Icons/FavoriteIcon';

interface ForumPostActionsFavoriteItemProps {
  forumPost: PostData;
}

export const ForumPostActionsFavoriteItem = ({forumPost}: ForumPostActionsFavoriteItemProps) => {
  const favoriteMutation = useForumPostBookmarkMutation();
  const {dispatchForumPosts} = useTwitarr();
  const theme = useAppTheme();

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

  const getIcon = () => <FavoriteIcon isFavorite={forumPost.isBookmarked} isLoading={favoriteMutation.isLoading} />;

  return (
    <Menu.Item
      title={forumPost.isBookmarked ? 'Unfavorite' : 'Favorite'}
      dense={false}
      leadingIcon={getIcon}
      onPress={handleFavorite}
    />
  );
};
