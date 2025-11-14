import {useQueryClient} from '@tanstack/react-query';
import React from 'react';
import {Menu} from 'react-native-paper';

import {StateLoadingIcon} from '#src/Components/Icons/StateLoadingIcon';
import {AppIcons} from '#src/Enums/Icons';
import {useForumPostPinMutation} from '#src/Queries/Forum/ForumPostPinMutations';
import {ForumData, PostData} from '#src/Structs/ControllerStructs';

interface ForumPostActionsPinItemProps {
  forumPost: PostData;
  forumData?: ForumData;
  closeMenu: () => void;
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
          props.closeMenu();
          if (props.forumData) {
            await Promise.all([
              queryClient.invalidateQueries({queryKey: [`/forum/${props.forumData.forumID}`]}),
              queryClient.invalidateQueries({queryKey: [`/forum/${props.forumData.forumID}/pinnedposts`]}),
              queryClient.invalidateQueries({queryKey: [`/forum/post/${props.forumPost.postID}/forum`]}),
            ]);
          } else {
            await queryClient.invalidateQueries({queryKey: [`/forum/post/${props.forumPost.postID}/forum`]});
          }
        },
      },
    );
  };

  const getIcon = () => (
    <StateLoadingIcon
      isLoading={pinMutation.isPending}
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
