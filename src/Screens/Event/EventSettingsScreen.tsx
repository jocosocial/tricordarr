import {Formik} from 'formik';
import React, {useState} from 'react';
import {View} from 'react-native';

import {BooleanField} from '#src/Components/Forms/Fields/BooleanField';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {PushNotificationConfig} from '#src/Libraries/AppConfig';
import {contentNotificationCategories} from '#src/Libraries/Notifications/Content';

export const EventSettingsScreen = () => {
  const {appConfig, updateAppConfig, hasNotificationPermission} = useConfig();
  const [enableLateDayFlip, setEnableLateDayFlip] = useState(appConfig.schedule.enableLateDayFlip);
  const {commonStyles} = useStyles();
  const [joined, setJoined] = useState(appConfig.schedule.eventsShowJoinedLfgs);
  const [open, setOpen] = useState(appConfig.schedule.eventsShowOpenLfgs);

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
                    'Show the next days schedule after 3:00AM rather than after Midnight. For example: With this setting enabled (default), opening the schedule at 2:00AM on Thursday will show you Wednesdays schedule by default. If this setting is disabled, at 2:00AM on Thursday you would see Thursdays schedule by default. This also affects the daily theme.'
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
