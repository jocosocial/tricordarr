import React from 'react';
import pluralize from 'pluralize';
import {ScheduleItemCardBase} from './ScheduleItemCardBase';
import {FezData, UserHeader} from '../../../libraries/Structs/ControllerStructs';
import {useAppTheme} from '../../../styles/Theme';
import {Badge} from 'react-native-paper';
import {StyleSheet} from 'react-native';
import {useStyles} from '../../Context/Contexts/StyleContext';

interface LfgCardProps {
  lfg: FezData;
  onPress?: () => void;
}

export const LfgCard = ({lfg, onPress}: LfgCardProps) => {
  const theme = useAppTheme();
  const unreadCount = lfg.members ? lfg.members.postCount - lfg.members.readCount : 0;
  const {commonStyles} = useStyles();

  const styles = StyleSheet.create({
    badge: {
      ...commonStyles.bold,
      ...commonStyles.paddingHorizontalSmall,
    },
  });

  const getBadge = () => {
    if (!!unreadCount || lfg.cancelled) {
      return (
        <Badge style={styles.badge}>
          {lfg.cancelled ? 'Cancelled' : `${unreadCount} new ${pluralize('post', unreadCount)}`}
        </Badge>
      );
    }
  };

  return (
    <ScheduleItemCardBase
      onPress={onPress}
      cardStyle={{
        backgroundColor: theme.colors.outline,
      }}
      title={lfg.title}
      author={`Hosted by: ${UserHeader.getByline(lfg.owner)}`}
      participation={lfg.members ? FezData.getParticipantLabel(lfg) : undefined}
      location={lfg.location}
      titleRight={getBadge}
      startTime={lfg.startTime}
      endTime={lfg.endTime}
      timeZone={lfg.timeZone}
      showDay={false}
    />
  );
};
