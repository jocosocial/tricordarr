import React, {useCallback} from 'react';
import {AppView} from '#src/Components/Views/AppView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {Text} from 'react-native-paper';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ChatStackParamList, ChatStackScreenComponents} from '#src/Navigation/Stacks/ChatStackNavigator';
import {usePhoneCallDeclineMutation} from '#src/Queries/PhoneCall/PhoneCallMutations';
import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {useAppTheme} from '#src/Styles/Theme';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';

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
