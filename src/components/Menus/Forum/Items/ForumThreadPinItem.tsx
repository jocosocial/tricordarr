import {QueryKey, useQueryClient} from '@tanstack/react-query';
import React, {Dispatch, SetStateAction} from 'react';
import {Menu} from 'react-native-paper';

import {StateLoadingIcon} from '#src/Components/Icons/StateLoadingIcon';
import {AppIcons} from '#src/Enums/Icons';
import {useForumPinMutation} from '#src/Queries/Forum/ForumThreadPinMutations';

interface ForumThreadPinItemProps {
  isPinned?: boolean;
  refreshing: boolean;
  invalidationQueryKeys: QueryKey[];
  closeMenu: () => void;
  setRefreshing: Dispatch<SetStateAction<boolean>>;
  categoryID: string;
  forumID: string;
}

export const ForumThreadPinItem = (props: ForumThreadPinItemProps) => {
  const pinMutation = useForumPinMutation();
  const queryClient = useQueryClient();

  const handlePin = () => {
    pinMutation.mutate(
      {
        forumID: props.forumID,
        action: props.isPinned ? 'unpin' : 'pin',
      },
      {
        onSuccess: async () => {
          const invalidations = props.invalidationQueryKeys.map(key => {
            return queryClient.invalidateQueries(key);
          });
          await Promise.all([invalidations].flat());
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

  return <Menu.Item title={props.isPinned ? 'Unpin' : 'Pin'} leadingIcon={getPinnedIcon} onPress={handlePin} />;
};
