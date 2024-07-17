import React from 'react';
import {PaddedContentView} from '../../../Views/Content/PaddedContentView';
import {AppView} from '../../../Views/AppView';
import {ScrollingContentView} from '../../../Views/Content/ScrollingContentView';
import {SettingForm} from '../../../Forms/Settings/SettingForm.tsx';
import {useConfig} from '../../../Context/Contexts/ConfigContext';
import {SettingFormValues} from '../../../../libraries/Types/FormValues';
import {useAuth} from '../../../Context/Contexts/AuthContext';
import {Text} from 'react-native-paper';
import {useStyles} from '../../../Context/Contexts/StyleContext';
import * as Yup from 'yup';
import {configureAxios} from '../../../../libraries/Network/APIClient';
import {usePrivilege} from '../../../Context/Contexts/PrivilegeContext';
import {useQueryClient} from '@tanstack/react-query';
import {ServerURLValidation} from '../../../../libraries/ValidationSchema';
import {useSwiftarrQueryClient} from '../../../Context/Contexts/SwiftarrQueryClientContext';
import {useHealthQuery} from '../../../Queries/Client/ClientQueries';
import {RefreshControl} from 'react-native';
import {PrimaryActionButton} from '../../../Buttons/PrimaryActionButton';
import {useAppTheme} from '../../../../styles/Theme';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {CommonStackComponents, CommonStackParamList} from '../../../Navigation/CommonScreens';

const validationSchema = Yup.object().shape({
  settingValue: ServerURLValidation,
});

type Props = NativeStackScreenProps<CommonStackParamList, CommonStackComponents.configServerUrl>;

export const ConfigServerUrlScreen = ({navigation}: Props) => {
  const {appConfig, updateAppConfig} = useConfig();
  const {signOut} = useAuth();
  const {commonStyles} = useStyles();
  const {clearPrivileges} = usePrivilege();
  const queryClient = useQueryClient();
  const {disruptionDetected} = useSwiftarrQueryClient();
  const {
    data: healthData,
    refetch: refetchHealth,
    isFetching: isFetchingHealth,
  } = useHealthQuery({
    enabled: false,
  });
  const theme = useAppTheme();

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
      <ScrollingContentView refreshControl={<RefreshControl refreshing={isFetchingHealth} enabled={false} />}>
        <PaddedContentView>
          <Text variant={'bodyLarge'} style={[commonStyles.bold, commonStyles.marginBottomSmall]}>
            Warning: It is recommended to fully restart the app after changing this value.
          </Text>
          <SettingForm
            value={appConfig.serverUrl}
            onSave={onSave}
            validationSchema={validationSchema}
            inputMode={'url'}
          />
        </PaddedContentView>
        {disruptionDetected && (
          <PaddedContentView>
            <Text style={[commonStyles.marginBottomSmall]}>
              Connection disruption detected. This can happen for a number of reasons such as:
            </Text>
            <Text>Leaving the ship</Text>
            <Text>Overcrowded or out-of-range WiFi</Text>
            <Text>Server Issue</Text>
            <Text style={[commonStyles.marginBottomSmall]}>VPN on your device</Text>
            <Text>
              If you believe this should not be the case, press the button below to attempt a server health check. If
              the issue persists for more than an hour, contact the JoCo Cruise Info Desk for assistance.
            </Text>
          </PaddedContentView>
        )}
        <PaddedContentView>
          <PrimaryActionButton
            style={[commonStyles.marginBottom]}
            buttonText={'Server Health Check'}
            onPress={refetchHealth}
            buttonColor={theme.colors.twitarrNeutralButton}
          />
          {healthData && <Text>{healthData.reason}</Text>}
          {healthData === null && <Text>No Data</Text>}
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
