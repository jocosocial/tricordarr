import {useQueryClient} from '@tanstack/react-query';
import React from 'react';

import {SelectableMenuItem} from '#src/Components/Menus/Items/SelectableMenuItem';
import {AppIcons} from '#src/Enums/Icons';
import {useEventNeedsPhotographerMutation} from '#src/Queries/Events/EventPhotographerMutations';
import {EventData} from '#src/Structs/ControllerStructs';

interface NeedsPhotographerMenuItemProps {
  eventID: string;
  shutternautData: EventData['shutternautData'];
  closeMenu: () => void;
}

export const NeedsPhotographerMenuItem = (props: NeedsPhotographerMenuItemProps) => {
  const queryClient = useQueryClient();
  const needsPhotographerMutation = useEventNeedsPhotographerMutation();

  const handleNeedsPhotographerToggle = () => {
    if (!props.shutternautData) {
      return;
    }
    needsPhotographerMutation.mutate(
      {
        eventID: props.eventID,
        action: props.shutternautData.needsPhotographer ? 'delete' : 'create',
      },
      {
        onSuccess: async () => {
          const invalidations = EventData.getCacheKeys(props.eventID).map(key =>
            queryClient.invalidateQueries({queryKey: key}),
          );
          await Promise.all(invalidations);
        },
      },
    );
    props.closeMenu();
  };

  if (!props.shutternautData) {
    return null;
  }

  return (
    <SelectableMenuItem
      title={'Needs Photographer'}
      leadingIcon={AppIcons.needsPhotographer}
      onPress={handleNeedsPhotographerToggle}
      selected={props.shutternautData.needsPhotographer}
    />
  );
};
