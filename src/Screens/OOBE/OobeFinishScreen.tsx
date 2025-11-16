import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';

import {OobeNoteCard} from '#src/Components/Cards/OobeNoteCard';
import {OobePreRegistrationCompleteCard} from '#src/Components/Cards/OobePreRegistrationCompleteCard';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {OobeButtonsView} from '#src/Components/Views/OobeButtonsView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {startPushProvider} from '#src/Libraries/Notifications/Push';
import {MainStackComponents} from '#src/Navigation/Stacks/MainStackNavigator';
import {OobeStackComponents, OobeStackParamList} from '#src/Navigation/Stacks/OobeStackNavigator';
import {RootStackComponents, useRootStack} from '#src/Navigation/Stacks/RootStackNavigator';
import {BottomTabComponents} from '#src/Navigation/Tabs/BottomTabNavigator';
import {useUserNotificationDataQuery} from '#src/Queries/Alert/NotificationQueries';

type Props = StackScreenProps<OobeStackParamList, OobeStackComponents.oobeFinishScreen>;

export const OobeFinishScreen = ({navigation}: Props) => {
  const {appConfig, updateAppConfig, preRegistrationMode} = useConfig();
  const {data: userNotificationData} = useUserNotificationDataQuery();
  const rootNavigation = useRootStack();

  const onFinish = async () => {
    updateAppConfig({
      ...appConfig,
      oobeCompletedVersion: appConfig.oobeExpectedVersion,
      // Hopefully this is set by the time we get here?
      ...(userNotificationData?.shipWifiSSID ? {wifiNetworkNames: [userNotificationData.shipWifiSSID]} : {}),
    });
    startPushProvider();
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
