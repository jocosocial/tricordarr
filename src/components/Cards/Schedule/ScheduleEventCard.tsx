import React from 'react';
import {Card, Text} from 'react-native-paper';
import {EventData} from '../../../libraries/Structs/ControllerStructs';
import {StyleSheet, View} from 'react-native';
import {parseISO} from 'date-fns';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {useAppTheme} from '../../../styles/Theme';
import {useCruise} from '../../Context/Contexts/CruiseContext';
import useDateTime, {
  calcCruiseDayTime,
  getDurationString,
  getLocalDate,
  getTimeZoneOffset
} from '../../../libraries/DateTime';
import {AndroidColor} from '@notifee/react-native';
import {ScheduleItem} from '../../../libraries/Types';
import moment from 'moment-timezone';
import {EventCardNowView} from '../../Views/Schedule/EventCardNowView';
import {EventCardSoonView} from '../../Views/Schedule/EventCardSoonView';

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
      paddingLeft: 0,
    },
    contentView: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    cardContent: {
      paddingLeft: 0,
      paddingTop: 0,
      paddingBottom: 0,
      justifyContent: 'center',
    },
    contentBody: {
      flex: 1,
      marginLeft: 20,
      paddingVertical: 20,
    },
    officialCard: {
      backgroundColor: theme.colors.twitarrNeutralButton,
    },
    shadowCard: {
      backgroundColor: theme.colors.twitarrLfgColor,
    },
    bodyText: {
      color: AndroidColor.WHITE,
    },
    lfgCard: {
      backgroundColor: 'rgb(46, 49, 51)',
    },
  });

  const itemStartTime = parseISO(item.startTime);
  const itemEndTime = parseISO(item.endTime);
  const eventStartDayTime = calcCruiseDayTime(itemStartTime, startDate, endDate);
  const eventEndDayTime = calcCruiseDayTime(itemEndTime, startDate, endDate);
  const nowDayTime = calcCruiseDayTime(minutelyUpdatingDate, startDate, endDate);

  // Calculate the minute offset. Positive means towards UTC (going into the future),
  // negative means away from UTC (going into the past).
  const tzOffset = getTimeZoneOffset('America/New_York', item.timeZone, item.startTime);
  // console.log(item.title, eventStartDayTime, eventEndDayTime, nowDayTime, tzOffset);

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
            nowDayTime.dayMinutes < eventEndDayTime.dayMinutes + tzOffset && (
              <EventCardNowView />
            )}
          {nowDayTime.cruiseDay === eventStartDayTime.cruiseDay &&
            nowDayTime.dayMinutes >= eventStartDayTime.dayMinutes - 30 + tzOffset &&
            nowDayTime.dayMinutes < eventStartDayTime.dayMinutes + tzOffset && (
              <EventCardSoonView />
            )}
          <View style={styles.contentBody}>
            <Text style={styles.bodyText} variant={'titleMedium'} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.bodyText} variant={'bodyMedium'} numberOfLines={1}>
              {getDurationString(item.startTime, item.endTime, item.timeZone)}
            </Text>
            <Text style={styles.bodyText} variant={'bodyMedium'} numberOfLines={1}>
              {item.location}
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};
