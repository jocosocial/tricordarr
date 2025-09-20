import React, {Dispatch, memo, SetStateAction, useState} from 'react';
import {FezData} from '#src/Structs/ControllerStructs';
import {ScheduleCardMarkerType} from '#src/Types';
import {PersonalEventCardActionsMenu} from '#src/Components/Menus/PersonalEvents/PersonalEventCardActionsMenu';
import {FezCard} from '#src/Components/Cards/Schedule/FezCard';

interface PersonalEventCardListItemProps {
  eventData: FezData;
  onPress?: () => void;
  marker?: ScheduleCardMarkerType;
  setRefreshing?: Dispatch<SetStateAction<boolean>>;
}

const PersonalEventCardListItemInternal = (props: PersonalEventCardListItemProps) => {
  const [menuVisible, setMenuVisible] = useState(false);

  const anchorContent = (
    <FezCard
      fez={props.eventData}
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
