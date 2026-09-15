import React from 'react';

import {SelectableMenuItem} from '#src/Components/Menus/Items/SelectableMenuItem';
import {AppIcons} from '#src/Enums/Icons';
import {useEventCacheReducer} from '#src/Hooks/Events/useEventCacheReducer';
import {useEventNeedsPhotographerMutation} from '#src/Queries/Events/EventPhotographerMutations';
import {EventData} from '#src/Structs/ControllerStructs';

interface NeedsPhotographerMenuItemProps {
  eventID: string;
  shutternautData: EventData['shutternautData'];
  closeMenu?: () => void;
}

export const NeedsPhotographerMenuItem = (props: NeedsPhotographerMenuItemProps) => {
  const needsPhotographerMutation = useEventNeedsPhotographerMutation();
  const {updateNeedsPhotographer} = useEventCacheReducer();

  const handleNeedsPhotographerToggle = () => {
    if (!props.shutternautData) {
      return;
    }
    const newValue = !props.shutternautData.needsPhotographer;
    needsPhotographerMutation.mutate(
      {
        eventID: props.eventID,
        action: newValue ? 'create' : 'delete',
      },
      {
        onSuccess: () => {
          updateNeedsPhotographer(props.eventID, newValue);
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
      title={'Needs Photographer'}
      leadingIcon={AppIcons.needsPhotographer}
      onPress={handleNeedsPhotographerToggle}
      selected={props.shutternautData.needsPhotographer}
    />
  );
};
