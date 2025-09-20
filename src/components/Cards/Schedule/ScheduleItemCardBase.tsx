import React, {ReactNode} from 'react';
import {Card, Text, TouchableRipple} from 'react-native-paper';
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {useStyles} from '#src/Components/Context/Contexts/StyleContext';
import {getDurationString} from '#src/Libraries/DateTime';
import {ScheduleCardMarkerType} from '#src/Libraries/Types';
import {EventCardNowView} from '#src/Components/Views/Schedule/EventCardNowView';
import {EventCardSoonView} from '#src/Components/Views/Schedule/EventCardSoonView';
import {UserHeader} from '#src/Libraries/Structs/ControllerStructs';
import {UserBylineTag} from '#src/Components/Text/Tags/UserBylineTag';

interface ScheduleItemCardBaseProps {
  title: string;
  author?: UserHeader;
  participation?: string;
  location?: string;
  onPress?: () => void;
  cardStyle?: StyleProp<ViewStyle>;
  titleRight?: () => ReactNode;
  startTime?: string;
  endTime?: string;
  timeZoneID?: string;
  showDay?: boolean;
  description?: string;
  onLongPress?: () => void;
  marker?: ScheduleCardMarkerType;
  titleHeader?: string;
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
  timeZoneID,
  onLongPress,
  marker,
  description,
  titleHeader,
  showDay = false,
}: ScheduleItemCardBaseProps) => {
  const {commonStyles} = useStyles();

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
      // I am convinced there is a regression in Android 15 or RN 0.76 on A15
      // because everything worked without it. Now for certain string lengths
      // an extra blank line gets drawn in the Text element. Happens with Paper
      // and Native components. The combination of lineHeight + fontWeight +
      // fontSize seem to be the trigger.
      // import {Text as NativeText} from 'react-native';
      // const nativeTextStyle: TextStyle = {
      //   fontWeight: 'bold',
      //   fontSize: 16,
      //   lineHeight: 24,
      //   backgroundColor: 'pink',
      // };
      // <NativeText style={nativeTextStyle}>Theme: Robot Day</NativeText>
      lineHeight: undefined,
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

  const duration = getDurationString(startTime, endTime, timeZoneID, showDay);

  return (
    <Card mode={'contained'} style={cardStyle}>
      <TouchableRipple onPress={onPress} onLongPress={onLongPress}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.contentView}>
            {marker === 'now' && <EventCardNowView />}
            {marker === 'soon' && <EventCardSoonView />}
            <View style={styles.contentBody}>
              <View style={styles.titleContainer}>
                <View style={styles.titleTextContainer}>
                  {titleHeader && (
                    <Text style={styles.titleText} variant={'titleMedium'}>
                      {titleHeader}
                    </Text>
                  )}
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
                <UserBylineTag
                  style={styles.bodyText}
                  variant={'bodyMedium'}
                  user={author}
                  prefix={'Hosted by:'}
                  includePronoun={false}
                />
              )}
              {participation && (
                <Text style={styles.bodyText} variant={'bodyMedium'}>
                  {participation}
                </Text>
              )}
              {description && (
                <Text style={styles.bodyText} variant={'bodyMedium'}>
                  {description}
                </Text>
              )}
            </View>
          </View>
        </Card.Content>
      </TouchableRipple>
    </Card>
  );
};
