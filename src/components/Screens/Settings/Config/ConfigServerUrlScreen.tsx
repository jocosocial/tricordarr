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

export const ConfigServerUrlScreen = () => {
  const {appConfig, updateAppConfig} = useConfig();
  const navigation = useSettingsStack();
  const {setErrorMessage} = useErrorHandler();
  const {signOut} = useAuth();

  const onSave = (values: SettingFormValues) => {
    try {
      const oldServerUrl = appConfig.serverUrl;
      updateAppConfig({
        ...appConfig,
        serverUrl: values.settingValue,
      });
      if (oldServerUrl !== values.settingValue) {
        signOut().then(() => navigation.goBack());
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
          <SettingForm value={appConfig.serverUrl} onSave={onSave} />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
