import React, {Dispatch, SetStateAction} from 'react';
import {Menu} from 'react-native-paper';

import {StateLoadingIcon} from '#src/Components/Icons/StateLoadingIcon';
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

  const getPinnedIcon = () => (
    <StateLoadingIcon
      iconTrue={AppIcons.moderator}
      iconFalse={AppIcons.moderator}
      state={props.isPinned}
      isLoading={props.refreshing}
    />
  );

  return (
    <Menu.Item
      title={props.isPinned ? 'Unpin Thread' : 'Pin Thread to Category'}
      leadingIcon={getPinnedIcon}
      onPress={handlePin}
    />
  );
};
