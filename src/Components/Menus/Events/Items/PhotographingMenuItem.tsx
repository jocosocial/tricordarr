import React from 'react';
import {Menu} from 'react-native-paper';

import {getStateLoadingIcon} from '#src/Components/Icons/StateLoadingIcon';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {useEventCacheReducer} from '#src/Hooks/Events/useEventCacheReducer';
import {useEventPhotographerMutation} from '#src/Queries/Events/EventPhotographerMutations';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries';
import {EventData} from '#src/Structs/ControllerStructs';

interface PhotographingMenuItemProps {
  event: EventData;
  closeMenu?: () => void;
}

export const PhotographingMenuItem = (props: PhotographingMenuItemProps) => {
  const {commonStyles} = useStyles();
  const photographerMutation = useEventPhotographerMutation();
  const {updatePhotographer} = useEventCacheReducer();
  // Our own header, so the optimistic update can put us in the event's photographers list.
  const {data: profileData} = useUserProfileQuery();

  const {event} = props;
  const shutternautData = event.shutternautData;

  const handlePhotographerToggle = () => {
    if (!shutternautData) {
      return;
    }
    const newValue = !shutternautData.userIsPhotographer;
    // Optimistic: flip the cache immediately rather than waiting on the network round trip.
    updatePhotographer(event, newValue, profileData?.header);
    photographerMutation.mutate(
      {
        eventID: event.eventID,
        action: newValue ? 'create' : 'delete',
      },
      {
        onError: () => {
          updatePhotographer(event, !newValue, profileData?.header);
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
      title={'Photographing'}
      style={shutternautData.userIsPhotographer ? commonStyles.surfaceVariant : undefined}
      leadingIcon={getStateLoadingIcon({
        isLoading: photographerMutation.isPending,
        state: shutternautData.userIsPhotographer,
        iconTrue: AppIcons.check,
        iconFalse: AppIcons.shutternaut,
      })}
      onPress={handlePhotographerToggle}
      disabled={photographerMutation.isPending}
    />
  );
};
