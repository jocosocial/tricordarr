import React, {Dispatch, memo, SetStateAction} from 'react';

import {EventCard} from '#src/Components/Cards/Schedule/EventCard';
import {EventCardActionsMenu} from '#src/Components/Menus/Events/EventCardActionsMenu';
import {EventData} from '#src/Structs/ControllerStructs';
import {ScheduleCardMarkerType} from '#src/Types';

interface EventCardListItemProps {
  eventData: EventData;
  onPress?: () => void;
  marker?: ScheduleCardMarkerType;
  setRefreshing?: Dispatch<SetStateAction<boolean>>;
}

const EventCardListItemInternal = (props: EventCardListItemProps) => {
  const anchorContent = <EventCard eventData={props.eventData} onPress={props.onPress} marker={props.marker} />;

  return (
    <EventCardActionsMenu eventData={props.eventData} setRefreshing={props.setRefreshing} anchor={anchorContent} />
  );
};

export const EventCardListItem = memo(EventCardListItemInternal);
