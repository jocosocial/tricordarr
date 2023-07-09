import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import React from 'react';
import {Text} from 'react-native-paper';
import {useConfig} from '../../Context/Contexts/ConfigContext';
import {PrimaryActionButton} from '../../Buttons/PrimaryActionButton';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../Navigation/Stacks/RootStackNavigator';
import {NavigatorIDs, RootStackComponents} from '../../../libraries/Enums/Navigation';

type Props = NativeStackScreenProps<RootStackParamList, RootStackComponents.oobeWelcomeScreen, NavigatorIDs.rootStack>;

export const OobeWelcomeScreen = ({navigation}: Props) => {
  const {appConfig, updateAppConfig} = useConfig();
  const onFinish = async () => {
    console.log('OOBE finished!');
    updateAppConfig({
      ...appConfig,
      oobeCompletedVersion: appConfig.oobeExpectedVersion,
    });
    // Bop Bop Bop
    navigation.replace(RootStackComponents.mainScreen);
  };
  return (
    <AppView>
      <ScrollingContentView isStack={false}>
        <Text>Welcome</Text>
        <PrimaryActionButton buttonText={'Finish'} onPress={onFinish} />
      </ScrollingContentView>
    </AppView>
  );
};
