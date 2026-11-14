import React, {Dispatch, SetStateAction} from 'react';
import {Menu} from 'react-native-paper';

import {getStateLoadingIcon} from '#src/Components/Icons/StateLoadingIcon';
import {AppIcons} from '#src/Enums/Icons';
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

  const handlePin = () => {
    props.setRefreshing(true);
    const newValue = !props.isPinned;
    // The mutation hook flips the cache optimistically and rolls back on error.
    pinMutation.mutate(
      {
        forumID: props.forumID,
        categoryID: props.categoryID,
        action: newValue ? 'pin' : 'unpin',
      },
      {
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
