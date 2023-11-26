import React, {useEffect, useState} from 'react';
import {AppView} from '../../../Views/AppView';
import {ScrollingContentView} from '../../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../../Views/Content/PaddedContentView';
import {useConfig} from '../../../Context/Contexts/ConfigContext';
import {PushNotificationConfig} from '../../../../libraries/AppConfig';
import {PrimaryActionButton} from '../../../Buttons/PrimaryActionButton';
import {useAppTheme} from '../../../../styles/Theme';
import {DataTable, Text} from 'react-native-paper';
import {check as checkPermission, PERMISSIONS, request as requestPermission, RESULTS} from 'react-native-permissions';
import {commonStyles} from '../../../../styles';
import {Formik} from 'formik';
import {View} from 'react-native';
import {BooleanField} from '../../../Forms/Fields/BooleanField';
import {contentNotificationCategories} from '../../../../libraries/Notifications/Content';
import {startForegroundServiceWorker} from '../../../../libraries/Service';

export const PushNotificationSettingsScreen = () => {
  const {appConfig, updateAppConfig} = useConfig();
  const theme = useAppTheme();
  const [permissionStatus, setPermissionStatus] = useState('Unknown');

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
    console.log('Requesting Permission!');
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
      <ScrollingContentView>
        <PaddedContentView>
          <Text variant={'titleMedium'} style={[commonStyles.marginBottomSmall]}>
            Permissions
          </Text>
          <DataTable>
            {permissionStatus === RESULTS.BLOCKED && (
              <Text>
                Notifications have been blocked by your device. You'll need to enable them for this app manually in the
                Android settings. You can access this by long pressing on the app icon on your home screen and selecting
                App Info.
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
        <PaddedContentView>
          <Text variant={'titleMedium'} style={[commonStyles.marginBottomSmall]}>
            Categories
          </Text>
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
      </ScrollingContentView>
    </AppView>
  );
};
