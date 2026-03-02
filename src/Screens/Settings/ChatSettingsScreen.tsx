import {Formik} from 'formik';
import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import {DataTable, Text} from 'react-native-paper';
import {
  check as checkPermission,
  PERMISSIONS,
  PermissionStatus,
  request as requestPermission,
  RESULTS,
} from 'react-native-permissions';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {BooleanField} from '#src/Components/Forms/Fields/BooleanField';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {usePermissions} from '#src/Context/Contexts/PermissionsContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {PushNotificationConfig} from '#src/Libraries/AppConfig';
import {contentNotificationCategories} from '#src/Libraries/Notifications/Content';
import {isIOS} from '#src/Libraries/Platform/Detection';

const microphonePermission = isIOS ? PERMISSIONS.IOS.MICROPHONE : PERMISSIONS.ANDROID.RECORD_AUDIO;

const chatNotificationCategories = [
  contentNotificationCategories.seamailUnreadMsg,
  contentNotificationCategories.addedToSeamail,
  contentNotificationCategories.incomingPhoneCall,
  contentNotificationCategories.phoneCallAnswered,
  contentNotificationCategories.phoneCallEnded,
];

export const ChatSettingsScreen = () => {
  const {appConfig, updateAppConfig} = useConfig();
  const {hasNotificationPermission} = usePermissions();
  const {commonStyles} = useStyles();
  const [micPermissionStatus, setMicPermissionStatus] = useState<PermissionStatus | undefined>();

  const checkMicPermission = useCallback(async () => {
    const status = await checkPermission(microphonePermission);
    setMicPermissionStatus(status);
  }, []);

  useEffect(() => {
    checkMicPermission();
  }, [checkMicPermission]);

  const handleEnableMicrophone = async () => {
    const status = await requestPermission(microphonePermission);
    setMicPermissionStatus(status);
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
        <ListSection>
          <ListSubheader>Permissions</ListSubheader>
          <PaddedContentView padTop={true}>
            <DataTable>
              {micPermissionStatus === RESULTS.BLOCKED && (
                <Text>
                  Microphone access has been blocked by your device. You'll need to enable it for this app manually in
                  your device settings.
                </Text>
              )}
              {micPermissionStatus !== RESULTS.BLOCKED && (
                <PrimaryActionButton
                  buttonText={micPermissionStatus === RESULTS.GRANTED ? 'Already Allowed' : 'Allow Microphone'}
                  onPress={handleEnableMicrophone}
                  disabled={micPermissionStatus === RESULTS.GRANTED}
                />
              )}
            </DataTable>
          </PaddedContentView>
        </ListSection>
        <PaddedContentView padSides={false}>
          <Formik initialValues={{}} onSubmit={() => {}}>
            <View>
              <ListSection>
                <ListSubheader>Push Notifications</ListSubheader>
                {chatNotificationCategories.map(category => (
                  <BooleanField
                    key={category.configKey}
                    name={category.configKey}
                    label={category.title}
                    value={appConfig.pushNotifications[category.configKey]}
                    onPress={() => toggleValue(category.configKey)}
                    disabled={!hasNotificationPermission}
                    helperText={category.description}
                    style={commonStyles.paddingHorizontalSmall}
                  />
                ))}
              </ListSection>
            </View>
          </Formik>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
