import React from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {OobeStackComponents, OobeStackParamList} from '#src/Navigation/Stacks/OobeStackNavigator.tsx';
import {AppView} from '#src/Views/AppView.tsx';
import {ScrollingContentView} from '#src/Views/Content/ScrollingContentView.tsx';
import {useConfig} from '#src/Context/Contexts/ConfigContext.ts';
import {RootStackComponents, useRootStack} from '#src/Navigation/Stacks/RootStackNavigator.tsx';
import {OobeButtonsView} from '#src/Views/OobeButtonsView.tsx';
import {PaddedContentView} from '#src/Views/Content/PaddedContentView.tsx';
import {startForegroundServiceWorker} from '../../../Libraries/Service.ts';
import {OobeNoteCard} from '#src/Cards/OobeNoteCard.tsx';
import {MainStackComponents} from '#src/Navigation/Stacks/MainStackNavigator.tsx';
import {BottomTabComponents} from '#src/Navigation/Tabs/BottomTabNavigator.tsx';
import {OobePreRegistrationCompleteCard} from '#src/Cards/OobePreRegistrationCompleteCard.tsx';

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
