import React from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {BottomTabComponents, OobeStackComponents} from '../../../libraries/Enums/Navigation';
import {OobeStackParamList} from '../../Navigation/Stacks/OobeStackNavigator';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {useConfig} from '../../Context/Contexts/ConfigContext';
import {RootStackComponents, useRootStack} from '../../Navigation/Stacks/RootStackNavigator';
import {OobeButtonsView} from '../../Views/OobeButtonsView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {startForegroundServiceWorker} from '../../../libraries/Service';
import {OobeNoteCard} from '../../Cards/OobeNoteCard';
import {MainStackComponents} from '../../Navigation/Stacks/MainStackNavigator.tsx';

type Props = NativeStackScreenProps<OobeStackParamList, OobeStackComponents.oobeFinishScreen>;

export const OobeFinishScreen = ({navigation}: Props) => {
  const {appConfig, updateAppConfig} = useConfig();
  const rootNavigation = useRootStack();

  const onFinish = async () => {
    updateAppConfig({
      ...appConfig,
      oobeCompletedVersion: appConfig.oobeExpectedVersion,
    });
    startForegroundServiceWorker();
    rootNavigation.replace(RootStackComponents.rootContentScreen, {
      screen: BottomTabComponents.homeTab,
      params: {
        screen: MainStackComponents.mainScreen,
      },
    });
  };

  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <PaddedContentView padTop={true}>
          <OobeNoteCard />
        </PaddedContentView>
      </ScrollingContentView>
      <OobeButtonsView leftOnPress={() => navigation.goBack()} rightText={'Finish'} rightOnPress={onFinish} />
    </AppView>
  );
};
