import {Formik} from 'formik';
import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
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
import {PushNotificationConfig} from '#src/Libraries/AppConfig';
import {contentNotificationCategories} from '#src/Libraries/Notifications/Content';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {useSettingsStack} from '#src/Navigation/Stacks/SettingsStackNavigator';

export const EventSettingsScreen = () => {
  const {appConfig, updateAppConfig} = useConfig();
  const {hasNotificationPermission} = usePermissions();
  const navigation = useSettingsStack();
  const [enableLateDayFlip, setEnableLateDayFlip] = useState(appConfig.schedule.enableLateDayFlip);
  const {commonStyles} = useStyles();
  const [joined, setJoined] = useState(appConfig.schedule.eventsShowJoinedLfgs);
  const [open, setOpen] = useState(appConfig.schedule.eventsShowOpenLfgs);
  const [overlapExcludeDurationHours, setOverlapExcludeDurationHours] = useState(
    appConfig.schedule.overlapExcludeDurationHours,
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
                  label={'Enable Late-Night Day Flip'}
                  helperText={
                    'Start and end your days at 3:00AM rather than 12:00AM midnight. Affects schedule viewing, the day planner, and daily themes.'
                  }
                  onPress={handleEnableLateDayFlip}
                  value={enableLateDayFlip}
                  style={commonStyles.paddingHorizontalSmall}
                />
              </ListSection>
              <ListSection>
                <ListSubheader>LFG Integration</ListSubheader>
                <BooleanField
                  name={'eventsShowJoinedLfgs'}
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
