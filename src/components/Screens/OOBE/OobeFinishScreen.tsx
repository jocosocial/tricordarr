import React from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {OobeStackComponents, OobeStackParamList} from '../../Navigation/Stacks/OobeStackNavigator';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {useConfig} from '../../Context/Contexts/ConfigContext';
import {RootStackComponents, useRootStack} from '../../Navigation/Stacks/RootStackNavigator';
import {OobeButtonsView} from '../../Views/OobeButtonsView';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {startForegroundServiceWorker} from '../../../libraries/Service';
import {OobeNoteCard} from '../../Cards/OobeNoteCard';
import {MainStackComponents} from '../../Navigation/Stacks/MainStackNavigator.tsx';
import {BottomTabComponents} from '../../Navigation/Tabs/BottomTabNavigator.tsx';
import {OobePreRegistrationCompleteCard} from '../../Cards/OobePreRegistrationCompleteCard.tsx';

type Props = NativeStackScreenProps<OobeStackParamList, OobeStackComponents.oobeFinishScreen>;

export const OobeFinishScreen = ({navigation}: Props) => {
  const {appConfig, updateAppConfig, preRegistrationMode} = useConfig();
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
    <AppView safeEdges={['bottom']}>
      <ScrollingContentView isStack={true}>
        <PaddedContentView padTop={true}>
          {preRegistrationMode ? <OobePreRegistrationCompleteCard /> : <OobeNoteCard />}
        </PaddedContentView>
      </ScrollingContentView>
      <OobeButtonsView
        leftOnPress={() => navigation.goBack()}
        rightText={'Finish'}
        rightOnPress={onFinish}
        rightDisabled={preRegistrationMode}
      />
    </AppView>
  );
};
