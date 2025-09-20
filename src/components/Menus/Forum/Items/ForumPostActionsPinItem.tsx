import {Menu} from 'react-native-paper';
import React from 'react';
import {ForumData, PostData} from '../../../../Libraries/Structs/ControllerStructs.tsx';
import {useForumPostPinMutation} from '../../../Queries/Forum/ForumPostPinMutations.ts';
import {StateLoadingIcon} from '../../../Icons/StateLoadingIcon.tsx';
import {AppIcons} from '../../../../Libraries/Enums/Icons.ts';
import {useQueryClient} from '@tanstack/react-query';

interface ForumPostActionsPinItemProps {
  forumPost: PostData;
  forumData?: ForumData;
}

export const ForumPostActionsPinItem = (props: ForumPostActionsPinItemProps) => {
  const pinMutation = useForumPostPinMutation();
  const queryClient = useQueryClient();

  const handleFavorite = () => {
    pinMutation.mutate(
      {
        postID: props.forumPost.postID.toString(),
        action: props.forumPost.isPinned ? 'unpin' : 'pin',
      },
      {
        onSuccess: async () => {
          if (props.forumData) {
            await Promise.all([
              queryClient.invalidateQueries([`/forum/${props.forumData.forumID}`]),
              queryClient.invalidateQueries([`/forum/${props.forumData.forumID}/pinnedposts`]),
              queryClient.invalidateQueries([`/forum/post/${props.forumPost.postID}/forum`]),
            ]);
          } else {
            await queryClient.invalidateQueries([`/forum/post/${props.forumPost.postID}/forum`]);
          }
        },
      },
    );
  };

  const getIcon = () => (
    <StateLoadingIcon
      isLoading={pinMutation.isLoading}
      state={props.forumPost.isPinned}
      iconTrue={AppIcons.unpin}
      iconFalse={AppIcons.pin}
    />
  );

  return (
    <Menu.Item
      title={props.forumPost.isPinned ? 'Unpin' : 'Pin'}
      dense={false}
      leadingIcon={getIcon}
      onPress={handleFavorite}
    />
  );
};
