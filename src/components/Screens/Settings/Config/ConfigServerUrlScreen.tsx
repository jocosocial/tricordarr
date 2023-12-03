import React from 'react';
import {PaddedContentView} from '../../../Views/Content/PaddedContentView';
import {AppView} from '../../../Views/AppView';
import {ScrollingContentView} from '../../../Views/Content/ScrollingContentView';
import {SettingForm} from '../../../Forms/SettingForm';
import {useConfig} from '../../../Context/Contexts/ConfigContext';
import {SettingFormValues} from '../../../../libraries/Types/FormValues';
import {useSettingsStack} from '../../../Navigation/Stacks/SettingsStack';
import {useAuth} from '../../../Context/Contexts/AuthContext';
import {Text} from 'react-native-paper';
import {useStyles} from '../../../Context/Contexts/StyleContext';
import * as Yup from 'yup';
import {configureAxios} from '../../../../libraries/Network/APIClient';
import {usePrivilege} from '../../../Context/Contexts/PrivilegeContext';
import {useQueryClient} from '@tanstack/react-query';
import {ServerURLValidation} from '../../../../libraries/ValidationSchema';

const validationSchema = Yup.object().shape({
  settingValue: ServerURLValidation,
});

export const ConfigServerUrlScreen = () => {
  const {appConfig, updateAppConfig} = useConfig();
  const navigation = useSettingsStack();
  const {signOut} = useAuth();
  const {commonStyles} = useStyles();
  const {clearPrivileges} = usePrivilege();
  const queryClient = useQueryClient();

  const onSave = (values: SettingFormValues) => {
    const oldServerUrl = appConfig.serverUrl;
    updateAppConfig({
      ...appConfig,
      serverUrl: values.settingValue,
    });
    if (oldServerUrl !== values.settingValue) {
      signOut().then(() => {
        clearPrivileges();
        queryClient.clear();
        configureAxios().then(() => navigation.goBack());
      });
    } else {
      navigation.goBack();
    }
  };

  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView>
          <Text variant={'bodyLarge'} style={[commonStyles.bold]}>
            Warning: It is recommended to fully restart the app after changing this value.
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
