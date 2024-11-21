import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import React, {useState} from 'react';
import {Formik} from 'formik';
import {useConfig} from '../../Context/Contexts/ConfigContext';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {View} from 'react-native';
import {BooleanField} from '../../Forms/Fields/BooleanField';
import {ListSection} from '../../Lists/ListSection.tsx';
import {ListSubheader} from '../../Lists/ListSubheader.tsx';

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

  const toggleEventNotifications = () => {
    updateAppConfig({
      ...appConfig,
      pushNotifications: {
        ...appConfig.pushNotifications,
        followedEventStarting: !appConfig.pushNotifications.followedEventStarting,
      },
    });
  };

  const togglePersonalEventNotifications = () => {
    updateAppConfig({
      ...appConfig,
      pushNotifications: {
        ...appConfig.pushNotifications,
        personalEventStarting: !appConfig.pushNotifications.personalEventStarting,
      },
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
                  style={commonStyles.paddingHorizontal}
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
                  style={commonStyles.paddingHorizontal}
                />
                <BooleanField
                  name={'eventsShowOpenLfgs'}
                  label={'Show Open LFGs'}
                  helperText={
                    'Display community-created Looking For Group events that are open to you in the Schedule screen along with Official and Shadow Cruise events. These can always be viewed under the LFG tab of this app.'
                  }
                  onPress={handleOpenLfgs}
                  value={open}
                  style={commonStyles.paddingHorizontal}
                />
              </ListSection>
              <ListSection>
                <ListSubheader>Push Notifications</ListSubheader>
                <BooleanField
                  key={'followedEventStarting'}
                  name={'followedEventStarting'}
                  label={'Followed Event Reminder Notifications'}
                  value={appConfig.pushNotifications.followedEventStarting}
                  onPress={toggleEventNotifications}
                  disabled={!hasNotificationPermission}
                  helperText={'Enable push notifications for reminders that a followed event is starting Soon™.'}
                  style={commonStyles.paddingHorizontal}
                />
                <BooleanField
                  key={'personalEventStarting'}
                  name={'personalEventStarting'}
                  label={'Personal Event Reminder Notifications'}
                  value={appConfig.pushNotifications.personalEventStarting}
                  onPress={togglePersonalEventNotifications}
                  disabled={!hasNotificationPermission}
                  helperText={'Enable push notifications for reminders that a personal event is starting Soon™.'}
                  style={commonStyles.paddingHorizontal}
                />
              </ListSection>
            </View>
          </Formik>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
