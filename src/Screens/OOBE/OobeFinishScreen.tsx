import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';

import {OobeNoteCard} from '#src/Components/Cards/OobeNoteCard';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {OobeButtonsView} from '#src/Components/Views/OobeButtonsView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useOobe} from '#src/Context/Contexts/OobeContext';
import {usePreRegistration} from '#src/Context/Contexts/PreRegistrationContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {startPushProvider} from '#src/Libraries/Notifications/Push';
import {MainStackComponents} from '#src/Navigation/Stacks/Main/MainStackComponents';
import {OobeStackComponents, OobeStackParamList} from '#src/Navigation/Stacks/Oobe/OobeStackComponents';
import {RootStackComponents, useRootStack} from '#src/Navigation/Stacks/Root/RootStackComponents';
import {BottomTabComponents} from '#src/Navigation/Tabs/Bottom/BottomTabComponents';
import {useUserNotificationDataQuery} from '#src/Queries/Alert/NotificationQueries';

type Props = StackScreenProps<OobeStackParamList, OobeStackComponents.oobeFinishScreen>;

export const OobeFinishScreen = ({navigation}: Props) => {
  const {appConfig, updateAppConfig} = useConfig();
  const {oobeFinish} = useOobe();
  const {preRegistrationMode} = usePreRegistration();
  const {isLoggedIn} = useSession();
  // Both the SSID lookup and push registration need a token; a user who proceeded through OOBE
  // without an account has nothing to gain from either here (they can log in later from Settings,
  // which starts push itself - see LoginScreen).
  const {data: userNotificationData} = useUserNotificationDataQuery({
    enabled: !preRegistrationMode && isLoggedIn,
  });
  const rootNavigation = useRootStack();

  const onFinish = async () => {
    oobeFinish();
    // Hopefully this is set by the time we get here?
    // @TODO replace this with the new api endpoint that gowtam wrote the other night.
    if (userNotificationData?.shipWifiSSID) {
      updateAppConfig({
        ...appConfig,
        wifiNetworkNames: [userNotificationData.shipWifiSSID],
      });
    }
    if (!preRegistrationMode && isLoggedIn) {
      startPushProvider();
    }
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
