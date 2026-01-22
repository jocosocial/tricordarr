import {useQueryClient} from '@tanstack/react-query';
import React from 'react';

import {SelectableMenuItem} from '#src/Components/Menus/Items/SelectableMenuItem';
import {AppIcons} from '#src/Enums/Icons';
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

  const handlePhotographerToggle = () => {
    if (!props.shutternautData) {
      return;
    }
    photographerMutation.mutate(
      {
        eventID: props.eventID,
        action: props.shutternautData.userIsPhotographer ? 'delete' : 'create',
      },
      {
        onSuccess: async () => {
          const invalidations = EventData.getCacheKeys(props.eventID).map(key =>
            queryClient.invalidateQueries({queryKey: key}),
          );
          await Promise.all(invalidations);
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
