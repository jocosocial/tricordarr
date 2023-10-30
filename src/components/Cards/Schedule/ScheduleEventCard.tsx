import React from 'react';
import {Card, Text} from 'react-native-paper';
import {EventData} from '../../../libraries/Structs/ControllerStructs';
import {StyleSheet, View} from 'react-native';
import {parseISO} from 'date-fns';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {useAppTheme} from '../../../styles/Theme';
import {useCruise} from '../../Context/Contexts/CruiseContext';
import useDateTime, {calcCruiseDayTime} from '../../../libraries/DateTime';

interface ScheduleEventCardProps {
  event: EventData;
}

export const ScheduleEventCard = ({event}: ScheduleEventCardProps) => {
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
    },
    markerText: {
      writingDirection: 'rtl',
      transform: [{rotate: '90deg'}],
      paddingVertical: 20,
      // backgroundColor: 'red',
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
      backgroundColor: theme.colors.twitarrNeutralButton,
    },
  });

  const startTime = parseISO(event.startTime);
  const endTime = parseISO(event.endTime);
  const eventStartDayTime = calcCruiseDayTime(startTime, startDate, endDate);
  const eventEndDayTime = calcCruiseDayTime(endTime, startDate, endDate);
  const nowDayTime = calcCruiseDayTime(minutelyUpdatingDate, startDate, endDate);

  return (
    <Card>
      <Card.Content style={styles.cardContent}>
        <View style={styles.contentView}>
          {nowDayTime.cruiseDay === eventStartDayTime.cruiseDay &&
            nowDayTime.dayMinutes >= eventStartDayTime.dayMinutes &&
            nowDayTime.dayMinutes < eventEndDayTime.dayMinutes && (
              <View style={[styles.markerView, styles.nowMarker]}>
                <Text style={styles.markerText}>Now</Text>
              </View>
            )}
          {nowDayTime.cruiseDay === eventStartDayTime.cruiseDay &&
            nowDayTime.dayMinutes >= eventStartDayTime.dayMinutes - 30 &&
            nowDayTime.dayMinutes < eventStartDayTime.dayMinutes && (
              <View style={[styles.markerView, styles.soonMarker]}>
                <Text style={styles.markerText}>Soon</Text>
              </View>
            )}
          <View style={styles.contentBody}>
            <Text>{event.title}</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};
