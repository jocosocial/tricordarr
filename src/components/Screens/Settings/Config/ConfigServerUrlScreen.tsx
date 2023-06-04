import React from 'react';
import {PaddedContentView} from '../../../Views/Content/PaddedContentView';
import {AppView} from '../../../Views/AppView';
import {ScrollingContentView} from '../../../Views/Content/ScrollingContentView';
import {SettingForm} from '../../../Forms/SettingForm';
import {useConfig} from '../../../Context/Contexts/ConfigContext';
import {SettingFormValues} from '../../../../libraries/Types/FormValues';
import {useSettingsStack} from '../../../Navigation/Stacks/SettingsStack';
import {useErrorHandler} from '../../../Context/Contexts/ErrorHandlerContext';

export const ConfigServerUrlScreen = () => {
  const {appConfig, updateAppConfig} = useConfig();
  const navigation = useSettingsStack();
  const {setErrorMessage} = useErrorHandler();

  const onSave = (values: SettingFormValues) => {
    try {
      updateAppConfig({
        ...appConfig,
        serverUrl: values.settingValue,
      });
      navigation.goBack();
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
