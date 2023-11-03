import React from 'react';
import {Card} from 'react-native-paper';
import {StyleSheet, View} from 'react-native';
import {parseISO} from 'date-fns';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {useAppTheme} from '../../../styles/Theme';
import {useCruise} from '../../Context/Contexts/CruiseContext';
import useDateTime, {calcCruiseDayTime, getBoatTimeMoment, getTimeZoneOffset} from '../../../libraries/DateTime';
import {CruiseDayTime, ScheduleItem} from '../../../libraries/Types';
import {EventCardNowView} from '../../Views/Schedule/EventCardNowView';
import {EventCardSoonView} from '../../Views/Schedule/EventCardSoonView';
import {EventCardBody} from '../../Views/Schedule/EventCardBody';

interface ScheduleEventCardProps {
  item: ScheduleItem;
  // nowDayTime: CruiseDayTime;
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

  const itemStartMoment = getBoatTimeMoment(item.startTime, item.timeZone);
  const itemEndMoment = getBoatTimeMoment(item.endTime, item.timeZone);
  const nowMoment = getBoatTimeMoment(minutelyUpdatingDate.toISOString(), 'AST');
  itemStartMoment.add(nowMoment.utcOffset(), 'minutes');
  itemEndMoment.add(nowMoment.utcOffset(), 'minutes');
  nowMoment.add(nowMoment.utcOffset(), 'minutes');

  // const itemStartTime = parseISO(item.startTime);
  // const itemEndTime = parseISO(item.endTime);
  const eventStartDayTime = calcCruiseDayTime(itemStartMoment.toDate(), startDate, endDate);
  const eventEndDayTime = calcCruiseDayTime(itemEndMoment.toDate(), startDate, endDate);
  const nowDayTime = calcCruiseDayTime(nowMoment.toDate(), startDate, endDate);

  console.log('------------------');
  // const nowMoment = getBoatTimeMoment(minutelyUpdatingDate.toISOString(), 'AST');
  // console.log(minutelyUpdatingDate.getHours(), minutelyUpdatingDate.getMinutes());
  // console.log(nowMoment.hours(), nowMoment.minutes());
  // console.log(minutelyUpdatingDate.toISOString());
  // const offset = nowMoment.utcOffset();
  // nowMoment.subtract(nowMoment.utcOffset(), 'minutes');
  console.log(nowMoment.toDate());
  // console.log(offset, minutelyUpdatingDate.getTimezoneOffset());
  // console.log(nowMoment.toISOString(false));
  // console.log(new Date(nowMoment.toISOString(true)).toISOString());
  console.log('Title:', item.title);
  console.log('Start:', eventStartDayTime);
  console.log('End:', eventEndDayTime);
  console.log('Now', nowDayTime, 'Offset', minutelyUpdatingDate.getTimezoneOffset());
  console.log('------------------');

  // Calculate the minute offset. Positive means towards UTC (going into the future),
  // negative means away from UTC (going into the past).
  // const tzOffset = 0;
  const tzOffset = getTimeZoneOffset('America/New_York', item.timeZone, item.startTime);
  // console.log(item.title, eventStartDayTime, eventEndDayTime, nowDayTime, tzOffset);
  // const nowTzOffset = getTimeZoneOffset('America/New_York', 'EST', minutelyUpdatingDate.toISOString());
  // console.log(minutelyUpdatingDate.getTimezoneOffset());

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
            nowDayTime.dayMinutes >= eventStartDayTime.dayMinutes + tzOffset &&
            nowDayTime.dayMinutes < eventEndDayTime.dayMinutes + tzOffset && <EventCardNowView />}
          {nowDayTime.cruiseDay === eventStartDayTime.cruiseDay &&
            nowDayTime.dayMinutes >= eventStartDayTime.dayMinutes - 30 + tzOffset &&
            nowDayTime.dayMinutes < eventStartDayTime.dayMinutes + tzOffset && <EventCardSoonView />}
          <EventCardBody scheduleItem={item} />
        </View>
      </Card.Content>
    </Card>
  );
};
