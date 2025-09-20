import {AppView} from '#src/Components/Views/AppView';
import React from 'react';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {Formik} from 'formik';
import {View} from 'react-native';
import {ListSubheader} from '#src/Components/Lists/ListSubheader';
import {ListSection} from '#src/Components/Lists/ListSection';
import {contentNotificationCategories} from '#src/Libraries/Notifications/Content';
import {BooleanField} from '#src/Components/Forms/Fields/BooleanField';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {PushNotificationConfig} from '#src/Libraries/AppConfig';

export const SeamailSettingsScreen = () => {
  const {appConfig, hasNotificationPermission, updateAppConfig} = useConfig();
  const {commonStyles} = useStyles();

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
                <ListSubheader>Push Notifications</ListSubheader>
                <BooleanField
                  key={contentNotificationCategories.seamailUnreadMsg.configKey}
                  name={contentNotificationCategories.seamailUnreadMsg.configKey}
                  label={contentNotificationCategories.seamailUnreadMsg.title}
                  value={appConfig.pushNotifications.forumMention}
                  onPress={() => toggleValue(contentNotificationCategories.forumMention.configKey)}
                  disabled={!hasNotificationPermission}
                  helperText={contentNotificationCategories.forumMention.description}
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
