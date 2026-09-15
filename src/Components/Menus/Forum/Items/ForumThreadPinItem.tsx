import React, {Dispatch, SetStateAction} from 'react';
import {Menu} from 'react-native-paper';

import {getStateLoadingIcon} from '#src/Components/Icons/StateLoadingIcon';
import {AppIcons} from '#src/Enums/Icons';
import {useForumCacheReducer} from '#src/Hooks/Forum/useForumCacheReducer';
import {useForumPinMutation} from '#src/Queries/Forum/ForumThreadPinMutations';

interface ForumThreadPinItemProps {
  isPinned?: boolean;
  refreshing: boolean;
  closeMenu: () => void;
  setRefreshing: Dispatch<SetStateAction<boolean>>;
  categoryID: string;
  forumID: string;
}

/** Moderator action to pin or unpin a forum thread in its category. */
export const ForumThreadPinItem = (props: ForumThreadPinItemProps) => {
  const pinMutation = useForumPinMutation();
  const {updatePinned} = useForumCacheReducer();

  const handlePin = () => {
    pinMutation.mutate(
      {
        forumID: props.forumID,
        action: props.isPinned ? 'unpin' : 'pin',
      },
      {
        onSuccess: () => {
          updatePinned(props.forumID, props.categoryID, !props.isPinned);
        },
        onSettled: () => {
          props.setRefreshing(false);
          props.closeMenu();
        },
      },
    );
  };

  return (
    <Menu.Item
      title={props.isPinned ? 'Unpin Thread' : 'Pin Thread to Category'}
      leadingIcon={getStateLoadingIcon({
        iconTrue: AppIcons.moderator,
        iconFalse: AppIcons.moderator,
        state: props.isPinned,
        isLoading: props.refreshing,
      })}
      onPress={handlePin}
    />
  );
};
