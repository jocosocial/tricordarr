import {Formik} from 'formik';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {SegmentedButtons, Text} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {BooleanField} from '#src/Components/Forms/Fields/BooleanField';
import {SliderField} from '#src/Components/Forms/Fields/SliderField';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {usePermissions} from '#src/Context/Contexts/PermissionsContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {TimeZoneLabelMode} from '#src/Enums/TimeZoneLabelMode';
import {PushNotificationConfig} from '#src/Libraries/AppConfig';
import {contentNotificationCategories} from '#src/Libraries/Notifications/Content';
import {CommonStackComponents} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useSettingsStack} from '#src/Navigation/Stacks/Settings/SettingsStackComponents';
import {SegmentedButtonType} from '#src/Types';

const timeZoneLabelButtons: SegmentedButtonType[] = [
  {
    value: TimeZoneLabelMode.offset,
    label: TimeZoneLabelMode.getLabel(TimeZoneLabelMode.offset),
    testID: 'timeZoneLabelOffset-button',
  },
  {
    value: TimeZoneLabelMode.abbreviation,
    label: TimeZoneLabelMode.getLabel(TimeZoneLabelMode.abbreviation),
    testID: 'timeZoneLabelAbbreviation-button',
  },
  {
    value: TimeZoneLabelMode.hidden,
    label: TimeZoneLabelMode.getLabel(TimeZoneLabelMode.hidden),
    testID: 'timeZoneLabelHidden-button',
  },
];

export const EventSettingsScreen = () => {
  const {appConfig, updateAppConfig} = useConfig();
  const {hasNotificationPermission} = usePermissions();
  const navigation = useSettingsStack();
  const [enableLateDayFlip, setEnableLateDayFlip] = useState(appConfig.schedule.enableLateDayFlip);
  const [compactThemeEvents, setCompactThemeEvents] = useState(appConfig.schedule.compactThemeEvents);
  const {commonStyles} = useStyles();
  const [joined, setJoined] = useState(appConfig.schedule.eventsShowJoinedLfgs);
  const [open, setOpen] = useState(appConfig.schedule.eventsShowOpenLfgs);
  const [overlapExcludeDurationHours, setOverlapExcludeDurationHours] = useState(
    appConfig.schedule.overlapExcludeDurationHours,
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        helperText: {
          ...commonStyles.marginTopSmall,
        },
      }),
    [commonStyles],
  );

  const handleOpenLfgs = () => {
    updateAppConfig({
      ...appConfig,
      schedule: {
        ...appConfig.schedule,
        eventsShowOpenLfgs: !appConfig.schedule.eventsShowOpenLfgs,
      },
    });
    setOpen(!appConfig.schedule.eventsShowOpenLfgs);
  };

  const handleJoinedLfgs = () => {
    updateAppConfig({
      ...appConfig,
      schedule: {
        ...appConfig.schedule,
        eventsShowJoinedLfgs: !appConfig.schedule.eventsShowJoinedLfgs,
      },
    });
    setJoined(!appConfig.schedule.eventsShowJoinedLfgs);
  };

  const handleEnableLateDayFlip = () => {
    updateAppConfig({
      ...appConfig,
      schedule: {
        ...appConfig.schedule,
        enableLateDayFlip: !appConfig.schedule.enableLateDayFlip,
      },
    });
    setEnableLateDayFlip(!appConfig.schedule.enableLateDayFlip);
  };

  const handleCompactThemeEvents = () => {
    updateAppConfig({
      ...appConfig,
      schedule: {
        ...appConfig.schedule,
        compactThemeEvents: !appConfig.schedule.compactThemeEvents,
      },
    });
    setCompactThemeEvents(!appConfig.schedule.compactThemeEvents);
  };

  /**
   * Persist the user's timezone label preference for schedule and event times.
   */
  const handleTimeZoneLabelMode = (value: string) => {
    updateAppConfig({
      ...appConfig,
      schedule: {
        ...appConfig.schedule,
        timeZoneLabelMode: value as TimeZoneLabelMode,
      },
    });
  };

  const toggleValue = (configKey: keyof PushNotificationConfig) => {
    let pushConfig = appConfig.pushNotifications;
    // https://bobbyhadz.com/blog/typescript-cannot-assign-to-because-it-is-read-only-property
    (pushConfig[configKey] as boolean) = !appConfig.pushNotifications[configKey];
    updateAppConfig({
      ...appConfig,
      pushNotifications: pushConfig,
    });
  };

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons>
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => navigation.push(CommonStackComponents.scheduleHelpScreen)}
          />
        </MaterialHeaderButtons>
      </View>
    );
  }, [navigation]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <PaddedContentView padSides={false}>
          <Formik initialValues={{}} onSubmit={() => {}}>
            <View>
              <ListSection>
                <ListSubheader>General</ListSubheader>
                <BooleanField
                  name={'enableLateDayFlip'}
                  testID={'enableLateDayFlip-switch'}
                  label={'Enable Late-Night Day Flip'}
                  helperText={
                    'Start and end your days at 3:00AM rather than 12:00AM midnight. Affects schedule viewing, the day planner, and daily themes.'
                  }
                  onPress={handleEnableLateDayFlip}
                  value={enableLateDayFlip}
                  style={commonStyles.paddingHorizontalSmall}
                />
                <BooleanField
                  name={'compactThemeEvents'}
                  testID={'compactThemeEvents-switch'}
                  label={'Compact Theme Events'}
                  helperText={
                    'Show daily theme events as compact cards in the Day Planner instead of spanning their full duration (typically all day). The event itself is unchanged — only the card size is affected.'
                  }
                  onPress={handleCompactThemeEvents}
                  value={compactThemeEvents}
                  style={commonStyles.paddingHorizontalSmall}
                />
              </ListSection>
              <ListSection>
                <ListSubheader>Timezone Labels</ListSubheader>
              </ListSection>
            </View>
          </Formik>
        </PaddedContentView>
        <PaddedContentView>
          <SegmentedButtons
            buttons={timeZoneLabelButtons}
            value={appConfig.schedule.timeZoneLabelMode}
            onValueChange={handleTimeZoneLabelMode}
          />
          <Text variant={'bodySmall'} style={styles.helperText}>
            Abbreviations like MST can mean different regions. Offsets (GMT-7) are unambiguous. Hidden omits the
            timezone from event times.
          </Text>
        </PaddedContentView>
        <PaddedContentView padSides={false}>
          <Formik initialValues={{}} onSubmit={() => {}}>
            <View>
              <ListSection>
                <ListSubheader>LFG Integration</ListSubheader>
                <BooleanField
                  name={'eventsShowJoinedLfgs'}
                  testID={'eventsShowJoinedLfgs-switch'}
                  label={'Show Joined LFGs'}
                  helperText={
                    'Display community-created Looking For Group events that you have joined in the Schedule screen along with Official and Shadow Cruise events. These can always be viewed under the LFG tab of this app.'
                  }
                  onPress={handleJoinedLfgs}
                  value={joined}
                  style={commonStyles.paddingHorizontalSmall}
                />
                <BooleanField
                  name={'eventsShowOpenLfgs'}
                  testID={'eventsShowOpenLfgs-switch'}
                  label={'Show Open LFGs'}
                  helperText={
                    'Display community-created Looking For Group events that are open to you in the Schedule screen along with Official and Shadow Cruise events. These can always be viewed under the LFG tab of this app.'
                  }
                  onPress={handleOpenLfgs}
                  value={open}
                  style={commonStyles.paddingHorizontalSmall}
                />
              </ListSection>
              <ListSection>
                <ListSubheader>Overlapping Events</ListSubheader>
                <SliderField
                  name={'overlapExcludeDurationHours'}
                  testID={'overlapExcludeDurationHours-slider'}
                  label={'Exclude Long Events from Overlap'}
                  value={overlapExcludeDurationHours}
                  minimumValue={0}
                  maximumValue={24}
                  step={1}
                  unit={'hour'}
                  helperText={
                    'Events with a duration equal to or longer than this value (in hours) will be excluded from the overlap list. Set to 0 to show all overlapping events regardless of duration.'
                  }
                  onValueChange={(value: number) => {
                    setOverlapExcludeDurationHours(value);
                  }}
                  onSlidingComplete={(value: number) => {
                    updateAppConfig({
                      ...appConfig,
                      schedule: {
                        ...appConfig.schedule,
                        overlapExcludeDurationHours: value,
                      },
                    });
                  }}
                  style={[commonStyles.paddingHorizontalSmall, commonStyles.paddingTopSmall]}
                />
              </ListSection>
              <ListSection>
                <ListSubheader>Push Notifications</ListSubheader>
                <BooleanField
                  key={contentNotificationCategories.followedEventStarting.configKey}
                  name={contentNotificationCategories.followedEventStarting.configKey}
                  testID={`${contentNotificationCategories.followedEventStarting.configKey}-switch`}
                  label={contentNotificationCategories.followedEventStarting.title}
                  value={appConfig.pushNotifications.followedEventStarting}
                  onPress={() => toggleValue(contentNotificationCategories.followedEventStarting.configKey)}
                  disabled={!hasNotificationPermission}
                  helperText={contentNotificationCategories.followedEventStarting.description}
                  style={commonStyles.paddingHorizontalSmall}
                />
                <BooleanField
                  key={contentNotificationCategories.personalEventStarting.configKey}
                  name={contentNotificationCategories.personalEventStarting.configKey}
                  testID={`${contentNotificationCategories.personalEventStarting.configKey}-switch`}
                  label={contentNotificationCategories.personalEventStarting.title}
                  value={appConfig.pushNotifications.personalEventStarting}
                  onPress={() => toggleValue(contentNotificationCategories.personalEventStarting.configKey)}
                  disabled={!hasNotificationPermission}
                  helperText={contentNotificationCategories.personalEventStarting.description}
                  style={commonStyles.paddingHorizontalSmall}
                />
                <BooleanField
                  key={contentNotificationCategories.addedToPrivateEvent.configKey}
                  name={contentNotificationCategories.addedToPrivateEvent.configKey}
                  testID={`${contentNotificationCategories.addedToPrivateEvent.configKey}-switch`}
                  label={contentNotificationCategories.addedToPrivateEvent.title}
                  value={appConfig.pushNotifications.addedToPrivateEvent}
                  onPress={() => toggleValue(contentNotificationCategories.addedToPrivateEvent.configKey)}
                  disabled={!hasNotificationPermission}
                  helperText={contentNotificationCategories.addedToPrivateEvent.description}
                  style={commonStyles.paddingHorizontalSmall}
                />
                <BooleanField
                  key={contentNotificationCategories.privateEventCanceled.configKey}
                  name={contentNotificationCategories.privateEventCanceled.configKey}
                  testID={`${contentNotificationCategories.privateEventCanceled.configKey}-switch`}
                  label={contentNotificationCategories.privateEventCanceled.title}
                  value={appConfig.pushNotifications.privateEventCanceled}
                  onPress={() => toggleValue(contentNotificationCategories.privateEventCanceled.configKey)}
                  disabled={!hasNotificationPermission}
                  helperText={contentNotificationCategories.privateEventCanceled.description}
                  style={commonStyles.paddingHorizontalSmall}
                />
                <BooleanField
                  key={contentNotificationCategories.privateEventUnreadMsg.configKey}
                  name={contentNotificationCategories.privateEventUnreadMsg.configKey}
                  testID={`${contentNotificationCategories.privateEventUnreadMsg.configKey}-switch`}
                  label={contentNotificationCategories.privateEventUnreadMsg.title}
                  value={appConfig.pushNotifications.privateEventUnreadMsg}
                  onPress={() => toggleValue(contentNotificationCategories.privateEventUnreadMsg.configKey)}
                  disabled={!hasNotificationPermission}
                  helperText={contentNotificationCategories.privateEventUnreadMsg.description}
                  style={commonStyles.paddingHorizontalSmall}
                />
              </ListSection>
            </View>
          </Formik>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
