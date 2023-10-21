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
import {OobeButtonsView} from '../../Views/OobeButtonsView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';

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
      <ScrollingContentView isStack={true}>
        <PaddedContentView padTop={true}>
          <Text>A note from the Twitarr development team:</Text>
        </PaddedContentView>
        <PaddedContentView>
          <Text>Thanks for using our app! We hope it enhances your vacation the way it does for us. Be excellent to each other and have a great cruise!</Text>
        </PaddedContentView>
      </ScrollingContentView>
      <OobeButtonsView
        leftOnPress={() => navigation.goBack()}
        rightText={'Finish'}
        rightOnPress={onFinish}
      />
    </AppView>
  );
};
