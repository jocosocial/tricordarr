import React from 'react';
import {PaddedContentView} from '../../../Views/Content/PaddedContentView';
import {AppView} from '../../../Views/AppView';
import {ScrollingContentView} from '../../../Views/Content/ScrollingContentView';
import {SettingForm} from '../../../Forms/SettingForm';
import {useConfig} from '../../../Context/Contexts/ConfigContext';
import {SettingFormValues} from '../../../../libraries/Types/FormValues';
import {SettingsStackParamList} from '../../../Navigation/Stacks/SettingsStack';
import {useErrorHandler} from '../../../Context/Contexts/ErrorHandlerContext';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {NavigatorIDs, SettingsStackScreenComponents} from '../../../../libraries/Enums/Navigation';
import {Text} from 'react-native-paper';

type Props = NativeStackScreenProps<
  SettingsStackParamList,
  SettingsStackScreenComponents.configShipSSID,
  NavigatorIDs.settingsStack
>;

export const ConfigShipSSIDScreen = ({navigation}: Props) => {
  const {appConfig, updateAppConfig} = useConfig();
  // const navigation = useSettingsStack();
  const {setErrorMessage} = useErrorHandler();

  const onSave = (values: SettingFormValues) => {
    try {
      updateAppConfig({
        ...appConfig,
        shipSSID: values.settingValue,
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
          <Text>
            Configure the known SSID of the ship WiFi. This influences notification checking behavior. When you are
            connected to this network the app assumes you are on the ship and that you have access to the Twitarr
            server.
          </Text>
        </PaddedContentView>
        <PaddedContentView>
          <SettingForm value={appConfig.shipSSID} onSave={onSave} />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
