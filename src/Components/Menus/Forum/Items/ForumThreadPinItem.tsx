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
  const {updatePinned, invalidateForum} = useForumCacheReducer();

  const handlePin = () => {
    props.setRefreshing(true);
    const newValue = !props.isPinned;
    // Optimistic: flip the cache immediately so the icon is already correct by the time the
    // spinner clears, instead of waiting on a (possibly slow) network round trip to do it.
    updatePinned(props.forumID, props.categoryID, newValue);
    pinMutation.mutate(
      {
        forumID: props.forumID,
        action: newValue ? 'pin' : 'unpin',
      },
      {
        onError: () => {
          updatePinned(props.forumID, props.categoryID, !newValue);
          invalidateForum(props.forumID, props.categoryID);
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
      // Menus stay open until onSettled closes them, so a mutation in flight is still tappable.
      // Without this a fast double-tap fires the toggle twice and can flip the state back. See #533.
      disabled={props.refreshing}
      onPress={handlePin}
    />
  );
};
