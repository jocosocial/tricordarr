import React from 'react';
import pluralize from 'pluralize';
import {ScheduleItemCardBase} from './ScheduleItemCardBase';
import {FezData, UserHeader} from '../../../libraries/Structs/ControllerStructs';
import {getDurationString} from '../../../libraries/DateTime';
import {useAppTheme} from '../../../styles/Theme';

interface LfgCardProps {
  lfg: FezData;
  onPress?: () => void;
  expandedView?: boolean;
}

export const LfgCard = ({lfg, onPress, expandedView = false}: LfgCardProps) => {
  const theme = useAppTheme();
  const unreadCount = lfg.members ? lfg.members.postCount - lfg.members.readCount : 0;

  return (
    <ScheduleItemCardBase
      onPress={onPress}
      cardStyle={{
        backgroundColor: theme.colors.outline,
      }}
      showBadge={!!unreadCount}
      title={lfg.title}
      badgeValue={`${unreadCount} new ${pluralize('post', unreadCount)}`}
      duration={getDurationString(lfg.startTime, lfg.endTime, lfg.timeZone, true)}
      author={`Hosted by: ${UserHeader.getByline(lfg.owner)}`}
      authorID={lfg.owner.userID}
      participation={
        lfg.members ? FezData.getParticipantLabel(lfg.members.participants.length, lfg.maxParticipants) : undefined
      }
      location={lfg.location}
      expandedView={expandedView}
    />
  );
};
