import React from 'react';
import {ScheduleItemCardBase} from './ScheduleItemCardBase';
import {PersonalEventData} from '../../../libraries/Structs/ControllerStructs';
import {useAppTheme} from '../../../styles/Theme';
import {ScheduleCardMarkerType} from '../../../libraries/Types';
import {StyleSheet} from 'react-native';

interface EventCardProps {
  eventData: PersonalEventData;
  onPress?: () => void;
  showDay?: boolean;
  marker?: ScheduleCardMarkerType;
  hideFavorite?: boolean;
  onLongPress?: () => void;
  titleHeader?: string;
}

export const PersonalEventCard = ({
  eventData,
  onPress,
  marker,
  onLongPress,
  titleHeader,
  showDay = false,
}: EventCardProps) => {
  const theme = useAppTheme();

  const styles = StyleSheet.create({
    card: {
      backgroundColor: theme.colors.twitarrOrange,
    },
  });

  return (
    <ScheduleItemCardBase
      onPress={onPress}
      cardStyle={styles.card}
      title={eventData.title}
      location={eventData.location}
      startTime={eventData.startTime}
      endTime={eventData.endTime}
      timeZoneID={eventData.timeZoneID}
      showDay={showDay}
      onLongPress={onLongPress}
      marker={marker}
      titleHeader={titleHeader}
    />
  );
};
