import {EventCard} from '#src/Components/Cards/Schedule/EventCard';
import React, {Dispatch, memo, SetStateAction, useState} from 'react';
import {EventData} from '#src/Structs/ControllerStructs';
import {ScheduleCardMarkerType} from '#src/Types';
import {EventCardActionsMenu} from '#src/Components/Menus/Events/EventCardActionsMenu';

interface EventCardListItemProps {
  eventData: EventData;
  onPress?: () => void;
  marker?: ScheduleCardMarkerType;
  setRefreshing?: Dispatch<SetStateAction<boolean>>;
}

const EventCardListItemInternal = (props: EventCardListItemProps) => {
  const [menuVisible, setMenuVisible] = useState(false);

  const anchorContent = (
    <EventCard
      eventData={props.eventData}
      onPress={props.onPress}
      marker={props.marker}
      onLongPress={() => setMenuVisible(true)}
    />
  );

  return (
    <EventCardActionsMenu
      eventData={props.eventData}
      setRefreshing={props.setRefreshing}
      menuVisible={menuVisible}
      setMenuVisible={setMenuVisible}
      anchor={anchorContent}
    />
  );
};

export const EventCardListItem = memo(EventCardListItemInternal);
