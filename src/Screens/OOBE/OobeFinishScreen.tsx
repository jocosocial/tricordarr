import React from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {OobeStackComponents, OobeStackParamList} from '#src/Navigation/Stacks/OobeStackNavigator';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {RootStackComponents, useRootStack} from '#src/Navigation/Stacks/RootStackNavigator';
import {OobeButtonsView} from '#src/Components/Views/OobeButtonsView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {startForegroundServiceWorker} from '#src/Libraries/Service';
import {OobeNoteCard} from '#src/Components/Cards/OobeNoteCard';
import {MainStackComponents} from '#src/Navigation/Stacks/MainStackNavigator';
import {BottomTabComponents} from '#src/Navigation/Tabs/BottomTabNavigator';
import {OobePreRegistrationCompleteCard} from '#src/Components/Cards/OobePreRegistrationCompleteCard';

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
