import {Menu} from 'react-native-paper';
import React from 'react';
import {PostData} from '../../../../libraries/Structs/ControllerStructs';
import {useTwitarr} from '../../../Context/Contexts/TwitarrContext';
import {ForumPostListActions} from '../../../Reducers/Forum/ForumPostListReducer';
import {useForumPostPinMutation} from '../../../Queries/Forum/ForumPostPinQueries';
import {StateLoadingIcon} from '../../../Icons/StateLoadingIcon';
import {AppIcons} from '../../../../libraries/Enums/Icons';

interface ForumPostActionsPinItemProps {
  forumPost: PostData;
}

export const ForumPostActionsPinItem = ({forumPost}: ForumPostActionsPinItemProps) => {
  const pinMutation = useForumPostPinMutation();
  const {dispatchForumPosts} = useTwitarr();

  const handleFavorite = () => {
    pinMutation.mutate(
      {
        postID: forumPost.postID.toString(),
        action: forumPost.isPinned ? 'unpin' : 'pin',
      },
      {
        onSuccess: () => {
          dispatchForumPosts({
            type: ForumPostListActions.updatePost,
            newPost: {
              ...forumPost,
              isPinned: !forumPost.isPinned,
            },
          });
        },
      },
    );
  };

  const getIcon = () => (
    <StateLoadingIcon
      isLoading={pinMutation.isLoading}
      state={forumPost.isPinned}
      iconTrue={AppIcons.unpin}
      iconFalse={AppIcons.pin}
    />
  );

  return (
    <Menu.Item
      title={forumPost.isPinned ? 'Unpin' : 'Pin'}
      dense={false}
      leadingIcon={getIcon}
      onPress={handleFavorite}
    />
  );
};
