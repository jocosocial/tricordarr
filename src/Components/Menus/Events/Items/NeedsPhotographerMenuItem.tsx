import React from 'react';
import {Menu} from 'react-native-paper';

import {getStateLoadingIcon} from '#src/Components/Icons/StateLoadingIcon';
import {useStyles} from '#src/Context/Contexts/StyleContext';
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
  const {commonStyles} = useStyles();
  const needsPhotographerMutation = useEventNeedsPhotographerMutation();
  const {updateNeedsPhotographer} = useEventCacheReducer();

  const handleNeedsPhotographerToggle = () => {
    if (!props.shutternautData) {
      return;
    }
    const newValue = !props.shutternautData.needsPhotographer;
    // Optimistic: flip the cache immediately rather than waiting on the network round trip.
    updateNeedsPhotographer(props.eventID, newValue);
    needsPhotographerMutation.mutate(
      {
        eventID: props.eventID,
        action: newValue ? 'create' : 'delete',
      },
      {
        onError: () => {
          updateNeedsPhotographer(props.eventID, !newValue);
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
      title={'Needs Photographer'}
      style={props.shutternautData.needsPhotographer ? commonStyles.surfaceVariant : undefined}
      leadingIcon={getStateLoadingIcon({
        isLoading: needsPhotographerMutation.isPending,
        state: props.shutternautData.needsPhotographer,
        iconTrue: AppIcons.check,
        iconFalse: AppIcons.needsPhotographer,
      })}
      onPress={handleNeedsPhotographerToggle}
      disabled={needsPhotographerMutation.isPending}
    />
  );
};
