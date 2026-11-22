import React from 'react';
import {Menu} from 'react-native-paper';

import {getStateLoadingIcon} from '#src/Components/Icons/StateLoadingIcon';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {useEventCacheReducer} from '#src/Hooks/Events/useEventCacheReducer';
import {useEventNeedsPhotographerMutation} from '#src/Queries/Events/EventPhotographerMutations';
import {EventData} from '#src/Structs/ControllerStructs';

interface NeedsPhotographerMenuItemProps {
  event: EventData;
  closeMenu?: () => void;
}

export const NeedsPhotographerMenuItem = (props: NeedsPhotographerMenuItemProps) => {
  const {commonStyles} = useStyles();
  const needsPhotographerMutation = useEventNeedsPhotographerMutation();
  const {updateNeedsPhotographer} = useEventCacheReducer();

  const {event} = props;
  const shutternautData = event.shutternautData;

  const handleNeedsPhotographerToggle = () => {
    if (!shutternautData) {
      return;
    }
    const newValue = !shutternautData.needsPhotographer;
    // Optimistic: flip the cache immediately rather than waiting on the network round trip.
    updateNeedsPhotographer(event, newValue);
    needsPhotographerMutation.mutate(
      {
        eventID: event.eventID,
        action: newValue ? 'create' : 'delete',
      },
      {
        onError: () => {
          updateNeedsPhotographer(event, !newValue);
        },
        onSettled: () => {
          props.closeMenu?.();
        },
      },
    );
  };

  if (!shutternautData) {
    return null;
  }

  return (
    <Menu.Item
      title={'Needs Photographer'}
      style={shutternautData.needsPhotographer ? commonStyles.surfaceVariant : undefined}
      leadingIcon={getStateLoadingIcon({
        isLoading: needsPhotographerMutation.isPending,
        state: shutternautData.needsPhotographer,
        iconTrue: AppIcons.check,
        iconFalse: AppIcons.needsPhotographer,
      })}
      onPress={handleNeedsPhotographerToggle}
      disabled={needsPhotographerMutation.isPending}
    />
  );
};
