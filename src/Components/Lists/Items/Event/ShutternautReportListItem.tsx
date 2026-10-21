import React, {useCallback, useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text, TouchableRipple} from 'react-native-paper';

import {UserChip} from '#src/Components/Chips/UserChip';
import {AppIcon} from '#src/Components/Icons/AppIcon';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {useTimeZone} from '#src/Hooks/useTimeZone';
import {getDurationString} from '#src/Libraries/DateTime';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {ShutternautScheduleReportData} from '#src/Structs/ControllerStructs';

interface ShutternautReportListItemProps {
  reportData: ShutternautScheduleReportData;
}

/**
 * One row of the photography-coverage report: when and where the event is, whether a Shutternaut
 * Manager flagged it as needing a photographer, and who (if anyone) has signed up to shoot it.
 * Tapping opens the event so a manager can act on it.
 */
export const ShutternautReportListItem = ({reportData}: ShutternautReportListItemProps) => {
  const navigation = useCommonStack();
  const {commonStyles} = useStyles();
  const {appConfig} = useConfig();
  const {tzAtTime} = useTimeZone();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          ...commonStyles.paddingHorizontalSmall,
          ...commonStyles.paddingVerticalSmall,
          ...commonStyles.flexColumn,
        },
        title: {
          ...commonStyles.fontSizeDefault,
          ...commonStyles.bold,
          ...commonStyles.onBackground,
        },
        detail: {
          ...commonStyles.onBackground,
        },
        titleContainer: {
          ...commonStyles.flexRow,
          ...commonStyles.justifySpaceBetween,
        },
        titleTextContainer: {
          ...commonStyles.flexStart,
          ...commonStyles.flex,
          minWidth: 0,
        },
        badgeContainer: {
          ...commonStyles.flexStart,
          ...commonStyles.marginLeftSmall,
        },
        photographerLabel: {
          ...commonStyles.fontSizeLabel,
          ...commonStyles.onBackground,
          ...commonStyles.marginTopSmall,
        },
        chips: {
          ...commonStyles.chipContainer,
        },
      }),
    [commonStyles],
  );

  // The report rows carry only a timezone abbreviation, not an IANA ID, so resolve the ID the
  // ship was in at the event's start before formatting.
  const durationString = getDurationString(
    reportData.startTime,
    reportData.endTime,
    tzAtTime(new Date(reportData.startTime)),
    true,
    appConfig.schedule.timeZoneLabelMode,
  );

  const onPress = useCallback(() => {
    navigation.push(CommonStackComponents.eventScreen, {eventID: reportData.eventID});
  }, [navigation, reportData.eventID]);

  const onPressPhotographer = useCallback(
    (userID: string) => {
      navigation.push(CommonStackComponents.userProfileScreen, {userID: userID});
    },
    [navigation],
  );

  return (
    <TouchableRipple onPress={onPress}>
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <View style={styles.titleTextContainer}>
            <Text style={styles.title} selectable={false}>
              {reportData.title}
            </Text>
          </View>
          <View style={styles.badgeContainer}>
            {reportData.needsPhotographer && <AppIcon icon={AppIcons.needsPhotographer} />}
          </View>
        </View>
        <Text style={styles.detail} selectable={false}>
          {durationString}
        </Text>
        <Text style={styles.detail} selectable={false}>
          {reportData.location}
        </Text>
        <Text style={styles.photographerLabel} selectable={false}>
          {reportData.photographers.length === 0 ? 'No photographers assigned' : 'Photographers:'}
        </Text>
        {reportData.photographers.length > 0 && (
          <View style={styles.chips}>
            {reportData.photographers.map(photographer => (
              <UserChip
                key={photographer.userID}
                userHeader={photographer}
                onPress={() => onPressPhotographer(photographer.userID)}
              />
            ))}
          </View>
        )}
      </View>
    </TouchableRipple>
  );
};
