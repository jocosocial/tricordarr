import React from 'react';
import {PaddedContentView} from '../../../Views/Content/PaddedContentView';
import {AppView} from '../../../Views/AppView';
import {ScrollingContentView} from '../../../Views/Content/ScrollingContentView';
import {SettingForm} from '../../../Forms/SettingForm';
import {useConfig} from '../../../Context/Contexts/ConfigContext';
import {SettingFormValues} from '../../../../libraries/Types/FormValues';
import {useSettingsStack} from '../../../Navigation/Stacks/SettingsStack';
import {useErrorHandler} from '../../../Context/Contexts/ErrorHandlerContext';
import {useAuth} from '../../../Context/Contexts/AuthContext';
import {Text} from 'react-native-paper';
import {useStyles} from '../../../Context/Contexts/StyleContext';
import * as Yup from 'yup';
import {configureAxios} from '../../../../libraries/Network/APIClient';

const validationSchema = Yup.object().shape({
  settingValue: Yup.string().required('Server URL cannot be empty.').url('Must be valid URL.'),
});

export const ConfigServerUrlScreen = () => {
  const {appConfig, updateAppConfig} = useConfig();
  const navigation = useSettingsStack();
  const {setErrorMessage} = useErrorHandler();
  const {signOut} = useAuth();
  const {commonStyles} = useStyles();

  const onSave = (values: SettingFormValues) => {
    try {
      const oldServerUrl = appConfig.serverUrl;
      updateAppConfig({
        ...appConfig,
        serverUrl: values.settingValue,
      });
      if (oldServerUrl !== values.settingValue) {
        signOut().then(() => configureAxios().then(() => navigation.goBack()));
      } else {
        navigation.goBack();
      }
    } catch (e) {
      setErrorMessage(e);
    }
  };

  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView>
          <Text variant={'bodyLarge'} style={[commonStyles.bold]}>
            Warning: Changing this value requires fully restarting the app.
          </Text>
          <SettingForm
            value={appConfig.serverUrl}
            onSave={onSave}
            validationSchema={validationSchema}
            inputMode={'url'}
          />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
