import {AppView} from '../../Views/AppView.tsx';
import React from 'react';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView.tsx';
import {PaddedContentView} from '../../Views/Content/PaddedContentView.tsx';
import {Formik} from 'formik';
import {View} from 'react-native';
import {ListSubheader} from '../../Lists/ListSubheader.tsx';
import {ListSection} from '../../Lists/ListSection.tsx';
import {contentNotificationCategories} from '../../../libraries/Notifications/Content.ts';
import {BooleanField} from '../../Forms/Fields/BooleanField.tsx';
import {useConfig} from '../../Context/Contexts/ConfigContext.ts';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';
import {PushNotificationConfig} from '../../../libraries/AppConfig.ts';

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
