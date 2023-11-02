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
      // justifyContent: 'flex-start',
      // backgroundColor: 'green',
    },
    markerView: {
      borderTopStartRadius: 12,
      borderBottomStartRadius: 12,
      height: '100%',
      // alignItems: 'center',
      // minWidth: 60,
      // justifyContent: 'center',
      flexDirection: 'row',
      // justifyContent: 'space-between',
      minWidth: 40,
    },
    markerContainer: {
      // backgroundColor: 'pink',
      justifyContent: 'center',
    },
    markerText: {
      writingDirection: 'rtl',
      transform: [{rotate: '90deg'}],
      paddingVertical: 20,
      // backgroundColor: 'red',
      width: 40,
      fontWeight: 'bold',
    },
    contentView: {
      // backgroundColor: 'pink',
      // minHeight: 30,
      flexDirection: 'row',
      alignItems: 'center',
    },
    cardContent: {
      paddingLeft: 0,
      paddingTop: 0,
      paddingBottom: 0,
      // minHeight: 40,
      justifyContent: 'center',
      // backgroundColor: 'pink',
    },
    contentBody: {
      flex: 1,
      // backgroundColor: 'orange',
      marginLeft: 20,
      paddingVertical: 20,
    },
    nowMarker: {
      backgroundColor: theme.colors.twitarrPositiveButton,
    },
    soonMarker: {
      // backgroundColor: theme.colors.twitarrNeutralButton,
      backgroundColor: '#FFD04D',
    },
    soonText: {
      color: AndroidColor.BLACK,
    },
    nowText: {
      color: AndroidColor.WHITE,
    },
    officialCard: {
      backgroundColor: theme.colors.twitarrNeutralButton,
      // backgroundColor: 'rgb(25, 135, 84)',
      // backgroundColor: '#833400',
      // backgroundColor: 'rgba(25, 18, 210, 0.2)',
      // backgroundColor: 'rgba(73, 205, 140, 0.2)',
    },
    shadowCard: {
      // backgroundColor: 'rgba(114, 85, 184, 0.2)',
      // backgroundColor: theme.colors.twitarrLfgColor,
      backgroundColor: theme.colors.twitarrLfgColor,
    },
    bodyText: {
      // backgroundColor: 'rgba(25, 18, 210, 0.2)',
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
    minHeight: 106,
  };

  return (
    <Card mode={'contained'} style={cardStyle}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.contentView}>
          {nowDayTime.cruiseDay === eventStartDayTime.cruiseDay &&
            nowDayTime.dayMinutes >= eventStartDayTime.dayMinutes + tzOffset &&
            nowDayTime.dayMinutes < eventEndDayTime.dayMinutes + tzOffset && (
              <View style={[styles.markerView, styles.nowMarker]}>
                <View style={styles.markerContainer}>
                  <Text style={[styles.markerText, styles.nowText]}>Now</Text>
                </View>
              </View>
            )}
          {nowDayTime.cruiseDay === eventStartDayTime.cruiseDay &&
            nowDayTime.dayMinutes >= eventStartDayTime.dayMinutes - 30 + tzOffset &&
            nowDayTime.dayMinutes < eventStartDayTime.dayMinutes + tzOffset && (
              <View style={[styles.markerView, styles.soonMarker]}>
                <View style={styles.markerContainer}>
                  <Text style={[styles.markerText, styles.soonText]}>Soon</Text>
                </View>
              </View>
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
