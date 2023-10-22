import React, {useEffect, useState} from 'react';
import {Text} from 'react-native-paper';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {NavigatorIDs, OobeStackComponents} from '../../../libraries/Enums/Navigation';
import {OobeStackParamList} from '../../Navigation/Stacks/OobeStackNavigator';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import * as Yup from 'yup';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {SettingForm} from '../../Forms/SettingForm';
import {useConfig} from '../../Context/Contexts/ConfigContext';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext';
import {SettingFormValues} from '../../../libraries/Types/FormValues';
import {FormikHelpers} from 'formik';
import {useHealthQuery} from '../../Queries/Client/ClientQueries';
import {HttpStatusCode} from 'axios';
import {OobeButtonsView} from '../../Views/OobeButtonsView';

type Props = NativeStackScreenProps<OobeStackParamList, OobeStackComponents.oobeServerScreen, NavigatorIDs.oobeStack>;

const validationSchema = Yup.object().shape({
  settingValue: Yup.string().required('Server URL cannot be empty.').url('Must be valid URL.'),
});

export const OobeServerScreen = ({navigation}: Props) => {
  const {appConfig, updateAppConfig} = useConfig();
  const {setErrorMessage} = useErrorHandler();
  const {data: serverHealthData, refetch} = useHealthQuery();
  const [serverHealthPassed, setServerHealthPassed] = useState(false);

  const onSave = (values: SettingFormValues, formikHelpers: FormikHelpers<SettingFormValues>) => {
    try {
      updateAppConfig({
        ...appConfig,
        serverUrl: values.settingValue,
      });
      refetch().then(() => formikHelpers.resetForm());
    } catch (e) {
      setErrorMessage(e);
    }
  };

  useEffect(() => {
    if (serverHealthData && serverHealthData.status === HttpStatusCode.Ok) {
      setServerHealthPassed(true);
    } else {
      setServerHealthPassed(false);
    }
  }, [serverHealthData]);

  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView>
          <Text>Do not change this unless instructed to do so by the Twitarr Dev Team or THO.</Text>
          <SettingForm
            value={appConfig.serverUrl}
            onSave={onSave}
            validationSchema={validationSchema}
            inputMode={'url'}
          />
        </PaddedContentView>
        <PaddedContentView>
          {serverHealthPassed && <Text>Server check passed!</Text>}
          {!serverHealthPassed && serverHealthData?.error && (
            <Text>
              The Twitarr server is down. Try again later. Error: {serverHealthData.reason} ({serverHealthData.status})
            </Text>
          )}
          {!serverHealthPassed && (
            <Text>
              Server check failed. Ensure your phone is on ship wifi, all VPNs and DNS interceptors are disabled, and
              the server URL is correct. If the issue persists go to the JoCo Cruise Info Desk for assistance.
            </Text>
          )}
        </PaddedContentView>
      </ScrollingContentView>
      <OobeButtonsView
        leftOnPress={() => navigation.goBack()}
        rightOnPress={() => navigation.push(OobeStackComponents.oobeConductScreen)}
        rightDisabled={!serverHealthPassed}
      />
    </AppView>
  );
};
