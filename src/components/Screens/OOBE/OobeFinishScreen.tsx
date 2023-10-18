import React from 'react';
import {Text} from 'react-native-paper';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {NavigatorIDs, OobeStackComponents, RootStackComponents} from '../../../libraries/Enums/Navigation';
import {OobeStackParamList} from '../../Navigation/Stacks/OobeStackNavigator';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {useConfig} from '../../Context/Contexts/ConfigContext';
import {PrimaryActionButton} from '../../Buttons/PrimaryActionButton';
import {useRootStack} from '../../Navigation/Stacks/RootStackNavigator';

type Props = NativeStackScreenProps<OobeStackParamList, OobeStackComponents.oobeFinishScreen, NavigatorIDs.oobeStack>;

export const OobeFinishScreen = ({navigation}: Props) => {
  const {appConfig, updateAppConfig} = useConfig();
  const rootNavigation = useRootStack();

  const onFinish = async () => {
    console.log('OOBE finished!');
    // updateAppConfig({
    //   ...appConfig,
    //   oobeCompletedVersion: appConfig.oobeExpectedVersion,
    // });
    rootNavigation.replace(RootStackComponents.rootContentScreen);
  };
  return (
    <AppView>
      <ScrollingContentView isStack={false}>
        <Text>Finish!</Text>
        <PrimaryActionButton buttonText={'Finish'} onPress={onFinish} />
      </ScrollingContentView>
    </AppView>
  );
};
