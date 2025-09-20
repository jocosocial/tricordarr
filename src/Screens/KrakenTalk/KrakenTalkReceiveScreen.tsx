import React, {useCallback} from 'react';
import {AppView} from '#src/Views/AppView.tsx';
import {ScrollingContentView} from '#src/Views/Content/ScrollingContentView.tsx';
import {Text} from 'react-native-paper';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ChatStackParamList, ChatStackScreenComponents} from '#src/Navigation/Stacks/ChatStackNavigator.tsx';
import {usePhoneCallDeclineMutation} from '#src/Queries/PhoneCall/PhoneCallMutations.ts';
import {PrimaryActionButton} from '#src/Buttons/PrimaryActionButton.tsx';
import {PaddedContentView} from '#src/Views/Content/PaddedContentView.tsx';
import {useAppTheme} from '../../../Styles/Theme.ts';
import {CommonStackComponents} from '#src/Navigation/CommonScreens.tsx';

type Props = NativeStackScreenProps<ChatStackParamList, ChatStackScreenComponents.krakenTalkReceiveScreen>;
export const KrakenTalkReceiveScreen = ({route, navigation}: Props) => {
  const declineMutation = usePhoneCallDeclineMutation();
  const theme = useAppTheme();

  const onDecline = () => {
    declineMutation.mutate({
      callID: route.params.callID,
    });
  };

  const seamailCreateHandler = useCallback(() => {
    navigation.push(CommonStackComponents.seamailCreateScreen, {
      initialUserHeader: {
        userID: route.params.callerUserID,
        username: route.params.callerUsername,
      },
    });
  }, [route, navigation]);

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
