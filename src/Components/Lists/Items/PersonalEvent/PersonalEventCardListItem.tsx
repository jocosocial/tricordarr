import React, {Dispatch, memo, SetStateAction} from 'react';

import {FezCard} from '#src/Components/Cards/Schedule/FezCard';
import {PersonalEventCardActionsMenu} from '#src/Components/Menus/PersonalEvents/PersonalEventCardActionsMenu';
import {FezData} from '#src/Structs/ControllerStructs';
import {ScheduleCardMarkerType} from '#src/Types';

interface PersonalEventCardListItemProps {
  eventData: FezData;
  onPress?: () => void;
  marker?: ScheduleCardMarkerType;
  setRefreshing?: Dispatch<SetStateAction<boolean>>;
}

const PersonalEventCardListItemInternal = (props: PersonalEventCardListItemProps) => {
  const anchorContent = <FezCard fez={props.eventData} onPress={props.onPress} marker={props.marker} />;

  return (
    <PersonalEventCardActionsMenu
      eventData={props.eventData}
      setRefreshing={props.setRefreshing}
      anchor={anchorContent}
    />
  );
};

export const PersonalEventCardListItem = memo(PersonalEventCardListItemInternal);
