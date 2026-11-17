import {useQueryClient} from '@tanstack/react-query';
import React from 'react';
import {Menu} from 'react-native-paper';

import {getStateLoadingIcon} from '#src/Components/Icons/StateLoadingIcon';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {useEventCacheReducer} from '#src/Hooks/Events/useEventCacheReducer';
import {useEventPhotographerMutation} from '#src/Queries/Events/EventPhotographerMutations';
import {EventData} from '#src/Structs/ControllerStructs';

interface PhotographingMenuItemProps {
  eventID: string;
  shutternautData: EventData['shutternautData'];
  closeMenu?: () => void;
}

export const PhotographingMenuItem = (props: PhotographingMenuItemProps) => {
  const queryClient = useQueryClient();
  const {commonStyles} = useStyles();
  const photographerMutation = useEventPhotographerMutation();
  const {updatePhotographer} = useEventCacheReducer();

  const handlePhotographerToggle = () => {
    if (!props.shutternautData) {
      return;
    }
    const newValue = !props.shutternautData.userIsPhotographer;
    // Optimistic: flip the cache immediately rather than waiting on the network round trip.
    updatePhotographer(props.eventID, newValue);
    photographerMutation.mutate(
      {
        eventID: props.eventID,
        action: newValue ? 'create' : 'delete',
      },
      {
        onSuccess: async () => {
          // The photographers header list (rendered only on the event detail screen) needs
          // the authoritative UserHeader from the server, so refetch just that one cache entry.
          await queryClient.invalidateQueries({queryKey: [`/events/${props.eventID}`]});
        },
        onError: () => {
          updatePhotographer(props.eventID, !newValue);
        },
        onSettled: () => {
          props.closeMenu?.();
        },
      },
    );
  };

  if (!props.shutternautData) {
    return null;
  }

  return (
    <Menu.Item
      title={'Photographing'}
      style={props.shutternautData.userIsPhotographer ? commonStyles.surfaceVariant : undefined}
      leadingIcon={getStateLoadingIcon({
        isLoading: photographerMutation.isPending,
        state: props.shutternautData.userIsPhotographer,
        iconTrue: AppIcons.check,
        iconFalse: AppIcons.shutternaut,
      })}
      onPress={handlePhotographerToggle}
      disabled={photographerMutation.isPending}
    />
  );
};
