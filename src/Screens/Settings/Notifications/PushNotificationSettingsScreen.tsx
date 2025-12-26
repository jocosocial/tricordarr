import {Formik} from 'formik';
import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {Platform} from 'react-native';
import {DataTable, SegmentedButtons, Text} from 'react-native-paper';
import {requestNotifications, RESULTS} from 'react-native-permissions';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {BooleanField} from '#src/Components/Forms/Fields/BooleanField';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {RelativeTimeTag} from '#src/Components/Text/Tags/RelativeTimeTag';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {usePermissions} from '#src/Context/Contexts/PermissionsContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {PushNotificationConfig} from '#src/Libraries/AppConfig';
import {contentNotificationCategories} from '#src/Libraries/Notifications/Content';
import {startPushProvider} from '#src/Libraries/Notifications/Push';
import {SegmentedButtonType} from '#src/Types';

export const PushNotificationSettingsScreen = () => {
  const {appConfig, updateAppConfig} = useConfig();
  const {
    hasNotificationPermission,
    setNotificationPermissionStatus,
    notificationPermissionStatus,
    setHasNotificationPermission,
  } = usePermissions();
  const {theme} = useAppTheme();
  const [muteDuration] = useState(0);
  const [muteNotifications, setMuteNotifications] = useState(appConfig.muteNotifications);
  const [markReadCancelPush, setMarkReadCancelPush] = useState(appConfig.markReadCancelPush);

  const muteButtons: SegmentedButtonType[] = [
    {value: '5', label: '5m'},
    {value: '10', label: '10m'},
    {value: '15', label: '15m'},
    {value: '30', label: '30m'},
    {value: '60', label: '1h'},
  ];

  const toggleMuteDuration = (value: string) => {
    const muteUntilDate = new Date(new Date().getTime() + Number(value) * 60 * 1000);
    setMuteNotifications(muteUntilDate);
    updateAppConfig({
      ...appConfig,
      muteNotifications: muteUntilDate,
    });
  };

  const resumeNotifications = () => {
    setMuteNotifications(undefined);
    updateAppConfig({
      ...appConfig,
      muteNotifications: undefined,
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

  const setAllValue = (value: boolean) => {
    let pushConfig = appConfig.pushNotifications;
    Object.values(contentNotificationCategories).flatMap(c => {
      if (!c.disabled) {
        (pushConfig[c.configKey] as boolean) = value;
      }
    });
    updateAppConfig({
      ...appConfig,
      pushNotifications: pushConfig,
    });
  };

  const handleEnable = () => {
    requestNotifications([]).then(({status}) => {
      setNotificationPermissionStatus(status);
      setHasNotificationPermission(status === RESULTS.GRANTED);
      if (status === RESULTS.GRANTED) {
        startPushProvider();
      }
    });
  };

  /**
   * This is not supported on iOS. Notifications are automatically dusmissed on push.
   */
  const toggleMarkReadCancelPush = () => {
    const newValue = !markReadCancelPush;
    updateAppConfig({
      ...appConfig,
      markReadCancelPush: newValue,
    });
    setMarkReadCancelPush(newValue);
  };

  useEffect(() => {
    if (appConfig.muteNotifications && new Date() >= appConfig.muteNotifications) {
      console.log('[PushNotificationSettingsScreen.tsx] muteNotifications expired, clearing');
      setMuteNotifications(undefined);
      updateAppConfig({
        ...appConfig,
        muteNotifications: undefined,
      });
    }
  }, [appConfig, updateAppConfig]);

  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <ListSection>
          <ListSubheader>Permissions</ListSubheader>
          <PaddedContentView padTop={true}>
            <DataTable>
              {notificationPermissionStatus === RESULTS.BLOCKED && (
                <Text>
                  Notifications have been blocked by your device. You'll need to enable them for this app manually.
                </Text>
              )}
              {notificationPermissionStatus !== RESULTS.BLOCKED && (
                <PrimaryActionButton
                  buttonText={hasNotificationPermission ? 'Already Allowed' : 'Allow Push Notifications'}
                  onPress={handleEnable}
                  disabled={hasNotificationPermission}
                />
              )}
            </DataTable>
          </PaddedContentView>
        </ListSection>
        <ListSection>
          <ListSubheader>Categories</ListSubheader>
          <PaddedContentView padTop={true}>
            <Text variant={'bodyMedium'}>
              Pick the types of actions you want to receive as push notifications. This only controls what generates a
              notification on your device, not what to get notified for within Twitarr.
            </Text>
            <Formik initialValues={{}} onSubmit={() => {}}>
              <View>
                {Object.values(contentNotificationCategories).flatMap(value => {
                  if (value.disabled) {
                    return null;
                  }
                  return (
                    <BooleanField
                      key={value.configKey}
                      name={value.configKey}
                      label={value.title}
                      value={appConfig.pushNotifications[value.configKey]}
                      onPress={() => toggleValue(value.configKey)}
                      disabled={!hasNotificationPermission || value.disabled}
                      helperText={value.description}
                    />
                  );
                })}
              </View>
            </Formik>
          </PaddedContentView>
          <PaddedContentView padTop={true}>
            <PrimaryActionButton
              buttonColor={theme.colors.twitarrPositiveButton}
              buttonText={'Enable All Categories'}
              onPress={() => setAllValue(true)}
              disabled={notificationPermissionStatus !== RESULTS.GRANTED}
            />
          </PaddedContentView>
          <PaddedContentView>
            <PrimaryActionButton
              buttonColor={theme.colors.twitarrNegativeButton}
              buttonText={'Disable All Categories'}
              onPress={() => setAllValue(false)}
              disabled={notificationPermissionStatus !== RESULTS.GRANTED}
            />
          </PaddedContentView>
        </ListSection>
        <ListSection>
          <ListSubheader>Temporary Mute</ListSubheader>
          <PaddedContentView padTop={true}>
            <Text variant={'bodyMedium'}>
              Temporarily mute push notifications from this app. This can be useful if there is a chat that is
              particularly distracting or you do not wish to be disturbed for a bit.
            </Text>
            {muteNotifications && (
              <PaddedContentView padTop={true}>
                <Text>
                  Resuming in <RelativeTimeTag date={muteNotifications} />
                </Text>
              </PaddedContentView>
            )}
          </PaddedContentView>
          <PaddedContentView>
            <SegmentedButtons
              buttons={muteButtons}
              value={muteDuration.toString()}
              onValueChange={toggleMuteDuration}
            />
          </PaddedContentView>
          <PaddedContentView>
            <PrimaryActionButton buttonText={'Resume'} onPress={resumeNotifications} disabled={!muteNotifications} />
          </PaddedContentView>
        </ListSection>
        {Platform.OS === 'android' && (
          <ListSection>
            <ListSubheader>Auto Cancel</ListSubheader>
            <PaddedContentView padTop={true}>
              <Text variant={'bodyMedium'}>
                Automatically dismiss push notifications for unread content when you have read the content. This can be
                useful if you tend to navigate to content (such as a Seamail conversation) without tapping on the
                notification and want the notification to go away.
              </Text>
              <Formik initialValues={{}} onSubmit={() => {}}>
                <View>
                  <BooleanField
                    name={'markReadCancelPush'}
                    label={'Dismiss Notifications on Read'}
                    value={markReadCancelPush}
                    onPress={toggleMarkReadCancelPush}
                    helperText={'This setting only applies to Seamails and LFGs at this time.'}
                  />
                </View>
              </Formik>
            </PaddedContentView>
          </ListSection>
        )}
      </ScrollingContentView>
    </AppView>
  );
};
