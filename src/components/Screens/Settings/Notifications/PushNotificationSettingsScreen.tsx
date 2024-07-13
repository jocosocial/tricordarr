import React, {useEffect, useState} from 'react';
import {AppView} from '../../../Views/AppView';
import {ScrollingContentView} from '../../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../../Views/Content/PaddedContentView';
import {useConfig} from '../../../Context/Contexts/ConfigContext';
import {PushNotificationConfig} from '../../../../libraries/AppConfig';
import {PrimaryActionButton} from '../../../Buttons/PrimaryActionButton';
import {useAppTheme} from '../../../../styles/Theme';
import {DataTable, SegmentedButtons, Text} from 'react-native-paper';
import {check as checkPermission, PERMISSIONS, request as requestPermission, RESULTS} from 'react-native-permissions';
import {Formik} from 'formik';
import {View} from 'react-native';
import {BooleanField} from '../../../Forms/Fields/BooleanField';
import {contentNotificationCategories} from '../../../../libraries/Notifications/Content';
import {startForegroundServiceWorker} from '../../../../libraries/Service';
import {ListSection} from '../../../Lists/ListSection.tsx';
import {ListSubheader} from '../../../Lists/ListSubheader.tsx';
import {SegmentedButtonType} from '../../../../libraries/Types';
import {SettingDataTableRow} from '../../../DataTables/SettingDataTableRow.tsx';
import {RelativeTimeTag} from '../../../Text/Tags/RelativeTimeTag.tsx';

export const PushNotificationSettingsScreen = () => {
  const {appConfig, updateAppConfig} = useConfig();
  const theme = useAppTheme();
  const [permissionStatus, setPermissionStatus] = useState('Unknown');
  const [muteDuration] = useState(0);
  const [muteNotifications, setMuteNotifications] = useState(appConfig.muteNotifications);

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
    contentNotificationCategories.flatMap(c => {
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
    requestPermission(PERMISSIONS.ANDROID.POST_NOTIFICATIONS).then(status => {
      setPermissionStatus(status);
      if (status === RESULTS.GRANTED) {
        startForegroundServiceWorker();
      }
    });
  };

  useEffect(() => {
    checkPermission(PERMISSIONS.ANDROID.POST_NOTIFICATIONS).then(status => {
      setPermissionStatus(status);
    });
  }, []);

  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <ListSection>
          <ListSubheader>Permissions</ListSubheader>
          <PaddedContentView padTop={true}>
            <DataTable>
              {permissionStatus === RESULTS.BLOCKED && (
                <Text>
                  Notifications have been blocked by your device. You'll need to enable them for this app manually in
                  the Android settings. You can access this by long pressing on the app icon on your home screen and
                  selecting App Info.
                </Text>
              )}
              {permissionStatus !== RESULTS.BLOCKED && (
                <PrimaryActionButton
                  buttonText={permissionStatus === RESULTS.GRANTED ? 'Already Allowed' : 'Allow Push Notifications'}
                  onPress={handleEnable}
                  disabled={permissionStatus === RESULTS.GRANTED}
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
                {contentNotificationCategories.flatMap(c => (
                  <BooleanField
                    key={c.configKey}
                    name={c.configKey}
                    label={c.title}
                    value={appConfig.pushNotifications[c.configKey]}
                    onPress={() => toggleValue(c.configKey)}
                    disabled={permissionStatus !== RESULTS.GRANTED || c.disabled}
                    helperText={c.description}
                  />
                ))}
              </View>
            </Formik>
          </PaddedContentView>
          <PaddedContentView padTop={true}>
            <PrimaryActionButton
              buttonColor={theme.colors.twitarrPositiveButton}
              buttonText={'Enable All Categories'}
              onPress={() => setAllValue(true)}
              disabled={permissionStatus !== RESULTS.GRANTED}
            />
          </PaddedContentView>
          <PaddedContentView>
            <PrimaryActionButton
              buttonColor={theme.colors.twitarrNegativeButton}
              buttonText={'Disable All Categories'}
              onPress={() => setAllValue(false)}
              disabled={permissionStatus !== RESULTS.GRANTED}
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
              <DataTable>
                <SettingDataTableRow title={'Resuming:'}>
                  <RelativeTimeTag date={muteNotifications} />
                </SettingDataTableRow>
              </DataTable>
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
      </ScrollingContentView>
    </AppView>
  );
};
