import React, {useCallback, useEffect, useState} from 'react';
import {Text} from 'react-native-paper';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {OobeStackComponents, OobeStackParamList} from '../../Navigation/Stacks/OobeStackNavigator';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {useConfig} from '../../Context/Contexts/ConfigContext';
import {ServerUrlFormValues} from '../../../libraries/Types/FormValues';
import {FormikHelpers} from 'formik';
import {useHealthQuery} from '../../Queries/Client/ClientQueries.ts';
import {HttpStatusCode} from 'axios';
import {OobeButtonsView} from '../../Views/OobeButtonsView';
import {OobeServerHeaderTitle} from '../../Navigation/Components/OobeServerHeaderTitle';
import {ServerHealthcheckResultView} from '../../Views/Settings/ServerHealthcheckResultView.tsx';
import {ServerUrlSettingForm} from '../../Forms/Settings/ServerUrlSettingForm.tsx';
import {RefreshControl} from 'react-native';
import {ServerChoices} from '../../../libraries/Network/ServerChoices.ts';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext.ts';

type Props = NativeStackScreenProps<OobeStackParamList, OobeStackComponents.oobeServerScreen>;

export const OobeServerScreen = ({navigation}: Props) => {
  const {appConfig, updateAppConfig} = useConfig();
  const {data: serverHealthData, refetch, isFetching} = useHealthQuery();
  const [serverHealthPassed, setServerHealthPassed] = useState(false);
  const getHeaderTitle = useCallback(() => <OobeServerHeaderTitle />, []);
  const {hasUnsavedWork} = useErrorHandler();

  const onSave = (values: ServerUrlFormValues, formikHelpers: FormikHelpers<ServerUrlFormValues>) => {
    updateAppConfig({
      ...appConfig,
      serverUrl: values.serverUrl,
    });
    refetch().then(() =>
      formikHelpers.resetForm({
        values: {
          serverChoice: ServerChoices.fromUrl(values.serverUrl),
          serverUrl: values.serverUrl,
        },
      }),
    );
  };

  useEffect(() => {
    if (serverHealthData && serverHealthData.status === HttpStatusCode.Ok) {
      setServerHealthPassed(true);
    } else {
      setServerHealthPassed(false);
    }
  }, [serverHealthData]);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: getHeaderTitle,
    });
  }, [getHeaderTitle, navigation]);

  return (
    <AppView>
      <ScrollingContentView refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}>
        <PaddedContentView>
          <Text>
            Before proceeding ensure that your phone is on ship WiFi and you have disabled any VPNs or other network
            blockers.
          </Text>
        </PaddedContentView>
        <PaddedContentView>
          <Text>
            Do not change this unless instructed to do so by the Twitarr Dev Team or THO. Or you know what you're doing.
          </Text>
        </PaddedContentView>
        <PaddedContentView>
          <ServerUrlSettingForm
            onSubmit={onSave}
            initialValues={{
              serverChoice: ServerChoices.fromUrl(appConfig.serverUrl),
              serverUrl: appConfig.serverUrl,
            }}
          />
        </PaddedContentView>
        {!hasUnsavedWork && (
          <PaddedContentView>
            <ServerHealthcheckResultView serverHealthPassed={serverHealthPassed} />
          </PaddedContentView>
        )}
      </ScrollingContentView>
      <OobeButtonsView
        leftOnPress={() => navigation.goBack()}
        rightOnPress={() => navigation.push(OobeStackComponents.oobeConductScreen)}
        rightDisabled={!serverHealthPassed || isFetching || hasUnsavedWork}
      />
    </AppView>
  );
};
