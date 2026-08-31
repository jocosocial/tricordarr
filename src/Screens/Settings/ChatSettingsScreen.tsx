import {Formik} from 'formik';
import React from 'react';
import {View} from 'react-native';
import {DataTable, Text} from 'react-native-paper';
import {RESULTS} from 'react-native-permissions';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {BooleanField} from '#src/Components/Forms/Fields/BooleanField';
import {ListSection} from '#src/Components/Lists/ListSection';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {usePermissions} from '#src/Context/Contexts/PermissionsContext';
import {useSeamailFilter} from '#src/Context/Contexts/SeamailFilterContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {FezChatCategory} from '#src/Enums/FezType';
import {PushNotificationConfig} from '#src/Libraries/AppConfig';
import {contentNotificationCategories} from '#src/Libraries/Notifications/Content';

const chatNotificationCategories = [
  contentNotificationCategories.seamailUnreadMsg,
  contentNotificationCategories.addedToSeamail,
  contentNotificationCategories.fezUnreadMsg,
  contentNotificationCategories.addedToLFG,
  contentNotificationCategories.privateEventUnreadMsg,
  contentNotificationCategories.addedToPrivateEvent,
  contentNotificationCategories.incomingPhoneCall,
  contentNotificationCategories.phoneCallAnswered,
  contentNotificationCategories.phoneCallEnded,
];

export const ChatSettingsScreen = () => {
  const {appConfig, updateAppConfig} = useConfig();
  const {hasNotificationPermission, microphonePermissionStatus, requestMicrophonePermission} = usePermissions();
  const {commonStyles} = useStyles();
  const {setSeamailChatCategories} = useSeamailFilter();
  const [includeLfgs, setIncludeLfgs] = React.useState(appConfig.userPreferences.seamailIncludeLfgs ?? true);
  const [includePrivateEvents, setIncludePrivateEvents] = React.useState(
    appConfig.userPreferences.seamailIncludePrivateEvents ?? true,
  );

  const toggleValue = (configKey: keyof PushNotificationConfig) => {
    let pushConfig = appConfig.pushNotifications;
    // https://bobbyhadz.com/blog/typescript-cannot-assign-to-because-it-is-read-only-property
    (pushConfig[configKey] as boolean) = !appConfig.pushNotifications[configKey];
    updateAppConfig({
      ...appConfig,
      pushNotifications: pushConfig,
    });
  };

  /**
   * Toggles whether joined LFG chats appear in the Seamail list.
   * Disabling also clears LFG from the active Seamail type filter.
   */
  const handleIncludeLfgs = () => {
    const newValue = !includeLfgs;
    updateAppConfig({
      ...appConfig,
      userPreferences: {
        ...appConfig.userPreferences,
        seamailIncludeLfgs: newValue,
      },
    });
    setIncludeLfgs(newValue);
    if (!newValue) {
      setSeamailChatCategories(prev => prev.filter(c => c !== FezChatCategory.lfg));
    }
  };

  /**
   * Toggles whether private event chats appear in the Seamail list.
   * Disabling also clears Private Event from the active Seamail type filter.
   */
  const handleIncludePrivateEvents = () => {
    const newValue = !includePrivateEvents;
    updateAppConfig({
      ...appConfig,
      userPreferences: {
        ...appConfig.userPreferences,
        seamailIncludePrivateEvents: newValue,
      },
    });
    setIncludePrivateEvents(newValue);
    if (!newValue) {
      setSeamailChatCategories(prev => prev.filter(c => c !== FezChatCategory.privateEvent));
    }
  };

  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <ListSection>
          <ListSubheader>Permissions</ListSubheader>
          <PaddedContentView padTop={true}>
            <DataTable>
              {microphonePermissionStatus === RESULTS.BLOCKED && (
                <Text>
                  Microphone access has been blocked by your device. You'll need to enable it for this app manually in
                  your device settings.
                </Text>
              )}
              {microphonePermissionStatus !== RESULTS.BLOCKED && (
                <PrimaryActionButton
                  testID={'chatAllowMicrophone-button'}
                  buttonText={microphonePermissionStatus === RESULTS.GRANTED ? 'Already Allowed' : 'Allow Microphone'}
                  onPress={requestMicrophonePermission}
                  disabled={microphonePermissionStatus === RESULTS.GRANTED}
                />
              )}
            </DataTable>
          </PaddedContentView>
        </ListSection>
        <PaddedContentView padSides={false}>
          <Formik initialValues={{}} onSubmit={() => {}}>
            <View>
              <ListSection>
                <ListSubheader>Seamail Chat List</ListSubheader>
                <BooleanField
                  name={'seamailIncludeLfgs'}
                  testID={'seamailIncludeLfgs-switch'}
                  label={'Include LFGs'}
                  value={includeLfgs}
                  onPress={handleIncludeLfgs}
                  helperText={
                    'Show chats for Looking For Group events you have joined in the Seamail list. LFGs can always be viewed under the LFG tab.'
                  }
                  style={commonStyles.paddingHorizontalSmall}
                />
                <BooleanField
                  name={'seamailIncludePrivateEvents'}
                  testID={'seamailIncludePrivateEvents-switch'}
                  label={'Include Private Events'}
                  value={includePrivateEvents}
                  onPress={handleIncludePrivateEvents}
                  helperText={
                    'Show chats for private events you are invited to in the Seamail list. Private events can always be viewed in the Schedule.'
                  }
                  style={commonStyles.paddingHorizontalSmall}
                />
              </ListSection>
              <ListSection>
                <ListSubheader>Push Notifications</ListSubheader>
                {chatNotificationCategories.map(category => (
                  <BooleanField
                    key={category.configKey}
                    name={category.configKey}
                    testID={`${category.configKey}-switch`}
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
