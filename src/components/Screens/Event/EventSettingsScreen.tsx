import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import React, {useEffect, useState} from 'react';
import {Formik} from 'formik';
import {useConfig} from '../../Context/Contexts/ConfigContext';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {View} from 'react-native';
import {BooleanField} from '../../Forms/Fields/BooleanField';
import {check as checkPermission, PERMISSIONS, RESULTS} from 'react-native-permissions';

export const EventSettingsScreen = () => {
  const {appConfig, updateAppConfig} = useConfig();
  const [enableLateDayFlip, setEnableLateDayFlip] = useState(appConfig.schedule.enableLateDayFlip);
  const {commonStyles} = useStyles();
  const [joined, setJoined] = useState(appConfig.schedule.eventsShowJoinedLfgs);
  const [open, setOpen] = useState(appConfig.schedule.eventsShowOpenLfgs);
  const [permissionStatus, setPermissionStatus] = useState('Unknown');

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

  useEffect(() => {
    checkPermission(PERMISSIONS.ANDROID.POST_NOTIFICATIONS).then(status => {
      setPermissionStatus(status);
    });
  }, []);

  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView padSides={false}>
          <Formik initialValues={{}} onSubmit={() => {}}>
            <View>
              <BooleanField
                name={'eventsShowJoinedLfgs'}
                label={'Show Joined LFGs in Events'}
                helperText={
                  'Display community-created Looking For Group events that you have joined in the Events screen along with Official and Shadow Cruise events.'
                }
                onPress={handleJoinedLfgs}
                value={joined}
                style={commonStyles.paddingHorizontal}
              />
              <BooleanField
                name={'eventsShowOpenLfgs'}
                label={'Show Open LFGs in Events'}
                helperText={
                  'Display community-created Looking For Group events that are open to you in the Events screen along with Official and Shadow Cruise events.'
                }
                onPress={handleOpenLfgs}
                value={open}
                style={commonStyles.paddingHorizontal}
              />
              <BooleanField
                name={'enableLateDayFlip'}
                label={'Enable Late-Night Day Flip'}
                helperText={
                  'Show the next days schedule after 3:00AM rather than after Midnight. For example: With this setting enabled (default), opening the schedule at 2:00AM on Thursday will show you Wednesdays schedule by default. If this setting is disabled, at 2:00AM on Thursday you would see Thursdays schedule by default.'
                }
                onPress={handleEnableLateDayFlip}
                value={enableLateDayFlip}
                style={commonStyles.paddingHorizontal}
              />
              <BooleanField
                key={'followedEventStarting'}
                name={'followedEventStarting'}
                label={'Followed Event Reminder Notifications'}
                value={appConfig.pushNotifications.followedEventStarting}
                onPress={toggleEventNotifications}
                disabled={permissionStatus !== RESULTS.GRANTED}
                helperText={'Enable push notifications for reminders that a followed event is starting Soon™.'}
                style={commonStyles.paddingHorizontal}
              />
            </View>
          </Formik>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
