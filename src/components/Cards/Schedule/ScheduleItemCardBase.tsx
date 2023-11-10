import React, {ReactNode} from 'react';
import {Card, Text, TouchableRipple} from 'react-native-paper';
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {useStyles} from '../../Context/Contexts/StyleContext';
import useDateTime, {calcCruiseDayTime, getDurationString, getTimeZoneOffset} from '../../../libraries/DateTime';
import {parseISO} from 'date-fns';
import {useCruise} from '../../Context/Contexts/CruiseContext';
import {EventCardNowView} from '../../Views/Schedule/EventCardNowView';
import {EventCardSoonView} from '../../Views/Schedule/EventCardSoonView';
import {useConfig} from '../../Context/Contexts/ConfigContext';

interface ScheduleItemCardBaseProps {
  title: string;
  author?: string;
  participation?: string;
  location?: string;
  onPress?: () => void;
  cardStyle?: StyleProp<ViewStyle>;
  titleRight?: () => ReactNode;
  startTime?: string;
  endTime?: string;
  timeZone?: string;
  showDay?: boolean;
  onLongPress?: () => void;
}

export const ScheduleItemCardBase = ({
  title,
  author,
  participation,
  cardStyle,
  location,
  onPress,
  titleRight,
  startTime,
  endTime,
  timeZone,
  onLongPress,
  showDay = false,
}: ScheduleItemCardBaseProps) => {
  const {commonStyles} = useStyles();
  const {startDate, endDate} = useCruise();
  const minutelyUpdatingDate = useDateTime('minute');
  const {appConfig} = useConfig();

  const styles = StyleSheet.create({
    cardContent: {
      ...commonStyles.paddingVerticalZero,
      ...commonStyles.paddingLeftZero,
      ...commonStyles.justifyCenter,
      ...commonStyles.paddingBottomZero,
    },
    contentView: {
      ...commonStyles.flexRow,
      ...commonStyles.alignItemsCenter,
    },
    contentBody: {
      ...commonStyles.flex,
      ...commonStyles.marginLeft,
      ...commonStyles.paddingVertical,
    },
    bodyText: {
      ...commonStyles.onTwitarrButton,
    },
    titleText: {
      ...commonStyles.bold,
      ...commonStyles.onTwitarrButton,
    },
    titleContainer: {
      ...commonStyles.flexRow,
      ...commonStyles.justifySpaceBetween,
    },
    titleTextContainer: {
      ...commonStyles.flexStart,
      ...commonStyles.flex,
    },
    badgeContainer: {
      ...commonStyles.flexEnd,
    },
  });

  const duration = getDurationString(startTime, endTime, timeZone, showDay);

  const itemStartTime = parseISO(startTime);
  const itemEndTime = parseISO(endTime);
  const eventStartDayTime = calcCruiseDayTime(itemStartTime, startDate, endDate);
  const eventEndDayTime = calcCruiseDayTime(itemEndTime, startDate, endDate);
  const nowDayTime = calcCruiseDayTime(minutelyUpdatingDate, startDate, endDate);
  const tzOffset = getTimeZoneOffset(appConfig.portTimeZoneID, timeZone, startTime);

  return (
    <Card mode={'contained'} style={cardStyle}>
      <TouchableRipple onPress={onPress} onLongPress={onLongPress}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.contentView}>
            {nowDayTime.cruiseDay === eventStartDayTime.cruiseDay &&
              nowDayTime.dayMinutes - tzOffset >= eventStartDayTime.dayMinutes &&
              nowDayTime.dayMinutes - tzOffset < eventEndDayTime.dayMinutes && <EventCardNowView />}
            {nowDayTime.cruiseDay === eventStartDayTime.cruiseDay &&
              nowDayTime.dayMinutes - tzOffset >= eventStartDayTime.dayMinutes - 30 &&
              nowDayTime.dayMinutes - tzOffset < eventStartDayTime.dayMinutes && <EventCardSoonView />}
            <View style={styles.contentBody}>
              <View style={styles.titleContainer}>
                <View style={styles.titleTextContainer}>
                  <Text style={styles.titleText} variant={'titleMedium'}>
                    {title}
                  </Text>
                </View>
                <View style={commonStyles.badgeContainer}>{titleRight && titleRight()}</View>
              </View>
              {duration && (
                <Text style={styles.bodyText} variant={'bodyMedium'}>
                  {duration}
                </Text>
              )}
              {location && (
                <Text style={styles.bodyText} variant={'bodyMedium'}>
                  {location}
                </Text>
              )}
              {author && (
                <Text style={styles.bodyText} variant={'bodyMedium'}>
                  {author}
                </Text>
              )}
              {participation && (
                <Text style={styles.bodyText} variant={'bodyMedium'}>
                  {participation}
                </Text>
              )}
            </View>
          </View>
        </Card.Content>
      </TouchableRipple>
    </Card>
  );
};
