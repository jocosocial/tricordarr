import {ScrollingContentView} from '../../../Views/Content/ScrollingContentView';
import React, {useState} from 'react';
import {AppView} from '../../../Views/AppView';
import {BooleanField} from '../../../Forms/Fields/BooleanField';
import {PaddedContentView} from '../../../Views/Content/PaddedContentView';
import {Formik} from 'formik';
import {View} from 'react-native';
import {useConfig} from '../../../Context/Contexts/ConfigContext';
import {useStyles} from '../../../Context/Contexts/StyleContext';
import humanizeDuration from 'humanize-duration';

export const NotificationPollerSettingsScreen = () => {
  const {appConfig, updateAppConfig} = useConfig();
  const [enable, setEnable] = useState(appConfig.enableNotificationPolling);
  const {commonStyles} = useStyles();

  const handleEnable = () => {
    const newValue = !appConfig.enableNotificationPolling;
    updateAppConfig({
      ...appConfig,
      enableNotificationPolling: newValue,
    });
    setEnable(newValue);
  };

  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView padSides={false}>
          <Formik initialValues={{}} onSubmit={() => {}}>
            <View>
              <BooleanField
                name={'enableNotificationPolling'}
                label={'Enable Notification Polling'}
                style={commonStyles.paddingHorizontal}
                onPress={handleEnable}
                helperText={`Enable periodic (${humanizeDuration(
                  appConfig.notificationPollInterval,
                )}) notification data polling. This functionality is redundant with the WebSockets and Background Worker, but exists in the event those perform poorly.`}
                value={enable}
              />
            </View>
          </Formik>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
