import React from 'react';
import {Card, Text} from 'react-native-paper';
import {EventData} from '../../../libraries/Structs/ControllerStructs';
import {StyleSheet, View} from 'react-native';
import {addMinutes, parseISO} from 'date-fns';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {useAppTheme} from '../../../styles/Theme';
import {useCruise} from '../../Context/Contexts/CruiseContext';
import {calcCruiseDayTime} from '../../../libraries/DateTime';

interface ScheduleEventCardProps {
  event: EventData;
}

export const ScheduleEventCard = ({event}: ScheduleEventCardProps) => {
  const {commonStyles} = useStyles();
  const theme = useAppTheme();
  const {cruiseDateNow, startDate, endDate, hourlyUpdatingDate} = useCruise();

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
  // console.log('Event: ', event.title, ' Start Time: ', startTime);
  const eventStartMinutes = calcCruiseDayTime(startTime, startDate, endDate)[0];
  const eventEndMinutes = calcCruiseDayTime(endTime, startDate, endDate)[0];
  const minutesSince3AM = calcCruiseDayTime(hourlyUpdatingDate, startDate, endDate)[0];

  console.log(
    'eventStartMinutes: ',
    eventStartMinutes,
    ' eventEndMinutes: ',
    eventEndMinutes,
    ' minutesSince3AM: ',
    minutesSince3AM,
  );

  return (
    <Card>
      <Card.Content style={styles.cardContent}>
        <View style={styles.contentView}>
          {minutesSince3AM >= eventStartMinutes && minutesSince3AM < eventEndMinutes && (
            <View style={[styles.markerView, styles.nowMarker]}>
              <Text style={styles.markerText}>Now</Text>
            </View>
          )}
          {(minutesSince3AM >= eventStartMinutes - 30) && minutesSince3AM < eventStartMinutes && (
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
