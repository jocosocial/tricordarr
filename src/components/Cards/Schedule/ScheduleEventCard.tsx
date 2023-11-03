import React from 'react';
import {Card} from 'react-native-paper';
import {StyleSheet, View} from 'react-native';
import {parseISO} from 'date-fns';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {useAppTheme} from '../../../styles/Theme';
import {useCruise} from '../../Context/Contexts/CruiseContext';
import useDateTime, {calcCruiseDayTime} from '../../../libraries/DateTime';
import {ScheduleItem} from '../../../libraries/Types';
import {EventCardNowView} from '../../Views/Schedule/EventCardNowView';
import {EventCardSoonView} from '../../Views/Schedule/EventCardSoonView';
import {EventCardBody} from '../../Views/Schedule/EventCardBody';

interface ScheduleEventCardProps {
  item: ScheduleItem;
}

export const ScheduleEventCard = ({item}: ScheduleEventCardProps) => {
  const {commonStyles} = useStyles();
  const theme = useAppTheme();
  const {startDate, endDate} = useCruise();
  const minutelyUpdatingDate = useDateTime('minute');

  const styles = StyleSheet.create({
    cardTitle: {
      ...commonStyles.paddingLeftZero,
    },
    contentView: {
      ...commonStyles.flexRow,
      ...commonStyles.alignItemsCenter,
    },
    cardContent: {
      ...commonStyles.paddingVerticalZero,
      ...commonStyles.paddingLeftZero,
      ...commonStyles.justifyCenter,
    },
    officialCard: {
      backgroundColor: theme.colors.twitarrNeutralButton,
    },
    shadowCard: {
      backgroundColor: theme.colors.jocoBlue,
    },
    lfgCard: {
      backgroundColor: theme.colors.twitarrGrey,
    },
  });

  const itemStartTime = parseISO(item.startTime);
  const itemEndTime = parseISO(item.endTime);
  const eventStartDayTime = calcCruiseDayTime(itemStartTime, startDate, endDate);
  const eventEndDayTime = calcCruiseDayTime(itemEndTime, startDate, endDate);
  const nowDayTime = calcCruiseDayTime(minutelyUpdatingDate, startDate, endDate);

  const cardStyle = {
    ...(item.itemType === 'shadow' ? styles.shadowCard : undefined),
    ...(item.itemType === 'official' ? styles.officialCard : undefined),
    ...(item.itemType === 'lfg' ? styles.lfgCard : undefined),
  };

  return (
    <Card mode={'contained'} style={cardStyle}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.contentView}>
          {nowDayTime.cruiseDay === eventStartDayTime.cruiseDay &&
            nowDayTime.dayMinutes >= eventStartDayTime.dayMinutes &&
            nowDayTime.dayMinutes < eventEndDayTime.dayMinutes && <EventCardNowView />}
          {nowDayTime.cruiseDay === eventStartDayTime.cruiseDay &&
            nowDayTime.dayMinutes >= eventStartDayTime.dayMinutes - 30 &&
            nowDayTime.dayMinutes < eventStartDayTime.dayMinutes && <EventCardSoonView />}
          <EventCardBody scheduleItem={item} />
        </View>
      </Card.Content>
    </Card>
  );
};
