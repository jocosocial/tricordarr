import React, {useCallback, useEffect, useState} from 'react';
import {AppView} from '../../Views/AppView';
import {ScrollingContentView} from '../../Views/Content/ScrollingContentView';
import {Text} from 'react-native-paper';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  BottomTabComponents,
  NavigatorIDs,
  RootStackComponents,
  SeamailStackScreenComponents,
} from '../../../libraries/Enums/Navigation';
import {SeamailStackParamList} from '../../Navigation/Stacks/SeamailStackNavigator';
import {usePhoneCallDeclineMutation} from '../../Queries/PhoneCall/PhoneCallMutations';
import {PrimaryActionButton} from '../../Buttons/PrimaryActionButton';
import {PaddedContentView} from '../../Views/Content/PaddedContentView';
import {useRootStack} from '../../Navigation/Stacks/RootStackNavigator';
import {useAppTheme} from '../../../styles/Theme';

export type Props = NativeStackScreenProps<
  SeamailStackParamList,
  SeamailStackScreenComponents.krakenTalkReceiveScreen,
  NavigatorIDs.seamailStack
>;
export const KrakenTalkReceiveScreen = ({navigation, route}: Props) => {
  const declineMutation = usePhoneCallDeclineMutation();
  const rootNavigation = useRootStack();
  const theme = useAppTheme();

  const onDecline = () => {
    declineMutation.mutate({
      callID: route.params.callID,
    });
  };

  const seamailCreateHandler = useCallback(() => {
    rootNavigation.push(RootStackComponents.rootContentScreen, {
      screen: BottomTabComponents.seamailTab,
      params: {
        screen: SeamailStackScreenComponents.seamailCreateScreen,
        params: {
          initialUserHeader: {
            userID: route.params.callerUserID,
            username: route.params.callerUsername,
          },
        },
      },
    });
  }, [route, rootNavigation]);

  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView>
          <Text>Incoming call from {route.params.callerUsername}!</Text>
        </PaddedContentView>
        <PaddedContentView>
          <Text>
            Sadly, this app doesn't know what to do about those yet. Press the button below to decline the call. Then
            consider sending them a Seamail or finding them in person.
          </Text>
        </PaddedContentView>
        <PaddedContentView>
          <PrimaryActionButton buttonText={'Decline'} onPress={onDecline} />
        </PaddedContentView>
        <PaddedContentView>
          <PrimaryActionButton
            buttonText={'New Seamail'}
            onPress={seamailCreateHandler}
            buttonColor={theme.colors.twitarrNeutralButton}
          />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
