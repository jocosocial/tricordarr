import {AppIcons} from '../../../../libraries/Enums/Icons';
import {ActivityIndicator, Menu} from 'react-native-paper';
import React from 'react';
import {PostData} from '../../../../libraries/Structs/ControllerStructs';
import {useForumPostBookmarkMutation} from '../../../Queries/Forum/ForumPostBookmarkQueries';
import {useTwitarr} from '../../../Context/Contexts/TwitarrContext';
import {ForumPostListActions} from '../../../Reducers/Forum/ForumPostListReducer';
import {AppIcon} from '../../../Images/AppIcon';
import {useAppTheme} from '../../../../styles/Theme';

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

  const getIcon = () => {
    if (favoriteMutation.isLoading) {
      return <ActivityIndicator />;
    }
    return <AppIcon icon={AppIcons.favorite} color={forumPost.isBookmarked ? theme.colors.twitarrYellow : undefined}/>
  };

  return (
    <Menu.Item
      title={forumPost.isBookmarked ? 'Unfavorite' : 'Favorite'}
      dense={false}
      leadingIcon={getIcon}
      onPress={handleFavorite}
    />
  );
};
