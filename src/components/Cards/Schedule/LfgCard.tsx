import React from 'react';
import pluralize from 'pluralize';
import {ScheduleItemCardBase} from './ScheduleItemCardBase';
import {FezData, UserHeader} from '../../../libraries/Structs/ControllerStructs';
import {getDurationString} from '../../../libraries/DateTime';
import {useAppTheme} from '../../../styles/Theme';

interface LfgCardProps {
  lfg: FezData;
  onPress?: () => void;
}

export const LfgCard = ({lfg, onPress}: LfgCardProps) => {
  const theme = useAppTheme();
  const unreadCount = lfg.members ? lfg.members.postCount - lfg.members.readCount : 0;

  return (
    <ScheduleItemCardBase
      onPress={onPress}
      cardStyle={{
        backgroundColor: theme.colors.outline,
      }}
      showBadge={!!unreadCount || lfg.cancelled}
      title={lfg.title}
      badgeValue={lfg.cancelled ? 'Cancelled' : `${unreadCount} new ${pluralize('post', unreadCount)}`}
      duration={getDurationString(lfg.startTime, lfg.endTime, lfg.timeZone, true)}
      author={`Hosted by: ${UserHeader.getByline(lfg.owner)}`}
      participation={lfg.members ? FezData.getParticipantLabel(lfg) : undefined}
      location={lfg.location}
    />
  );
};
