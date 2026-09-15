import {useQueryClient} from '@tanstack/react-query';
import React from 'react';

import {SelectableMenuItem} from '#src/Components/Menus/Items/SelectableMenuItem';
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
  const photographerMutation = useEventPhotographerMutation();
  const {updatePhotographer} = useEventCacheReducer();

  const handlePhotographerToggle = () => {
    if (!props.shutternautData) {
      return;
    }
    const newValue = !props.shutternautData.userIsPhotographer;
    photographerMutation.mutate(
      {
        eventID: props.eventID,
        action: newValue ? 'create' : 'delete',
      },
      {
        onSuccess: async () => {
          updatePhotographer(props.eventID, newValue);
          // The photographers header list (rendered only on the event detail screen) needs
          // the authoritative UserHeader from the server, so refetch just that one cache entry.
          await queryClient.invalidateQueries({queryKey: [`/events/${props.eventID}`]});
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
    <SelectableMenuItem
      title={'Photographing'}
      leadingIcon={AppIcons.shutternaut}
      onPress={handlePhotographerToggle}
      selected={props.shutternautData.userIsPhotographer}
    />
  );
};
