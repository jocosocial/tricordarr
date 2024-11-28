import React, {Dispatch, memo, SetStateAction, useState} from 'react';
import {PersonalEventData} from '../../../../libraries/Structs/ControllerStructs';
import {ScheduleCardMarkerType} from '../../../../libraries/Types';
import {PersonalEventCard} from '../../../Cards/Schedule/PersonalEventCard.tsx';
import {PersonalEventCardActionsMenu} from '../../../Menus/PersonalEvents/PersonalEventCardActionsMenu.tsx';

interface PersonalEventCardListItemProps {
  eventData: PersonalEventData;
  onPress?: () => void;
  marker?: ScheduleCardMarkerType;
  setRefreshing?: Dispatch<SetStateAction<boolean>>;
}

const PersonalEventCardListItemInternal = (props: PersonalEventCardListItemProps) => {
  const [menuVisible, setMenuVisible] = useState(false);

  const anchorContent = (
    <PersonalEventCard
      eventData={props.eventData}
      onPress={props.onPress}
      marker={props.marker}
      onLongPress={() => setMenuVisible(true)}
    />
  );

  return (
    <PersonalEventCardActionsMenu
      eventData={props.eventData}
      setRefreshing={props.setRefreshing}
      menuVisible={menuVisible}
      setMenuVisible={setMenuVisible}
      anchor={anchorContent}
    />
  );
};

export const PersonalEventCardListItem = memo(PersonalEventCardListItemInternal);
