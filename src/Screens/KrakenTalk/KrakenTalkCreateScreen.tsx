import {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect} from 'react';

import {UserMatchSearchBar} from '#src/Components/Search/UserSearchBar/UserMatchSearchBar';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {CallState, useCall} from '#src/Context/Contexts/CallContext';
import {ChatStackParamList, ChatStackScreenComponents} from '#src/Navigation/Stacks/ChatStackNavigator';
import {UserHeader} from '#src/Structs/ControllerStructs';

type Props = StackScreenProps<ChatStackParamList, ChatStackScreenComponents.krakentalkCreateScreen>;

export const KrakenTalkCreateScreen = ({route, navigation}: Props) => {
  const {initiateCall, currentCall, callState} = useCall();

  // If initialUserHeader is provided, initiate call immediately
  useEffect(() => {
    if (route.params?.initialUserHeader) {
      handleInitiateCall(route.params.initialUserHeader);
    }
  }, [route.params?.initialUserHeader, handleInitiateCall]);

  // Navigate to ActiveCallScreen when call is initiated
  useEffect(() => {
    if (
      currentCall &&
      (callState === CallState.INITIATING || callState === CallState.CONNECTING || callState === CallState.ACTIVE)
    ) {
      navigation.replace(ChatStackScreenComponents.activeCallScreen, {
        callID: currentCall.callID,
      });
    }
  }, [currentCall, callState, navigation]);

  const handleInitiateCall = useCallback(
    async (userHeader: UserHeader) => {
      try {
        await initiateCall(userHeader);
      } catch (error) {
        console.error('[KrakenTalkCreateScreen] Failed to initiate call:', error);
      }
    },
    [initiateCall],
  );

  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView>
          <UserMatchSearchBar
            label={'Search for a user to call'}
            onPress={handleInitiateCall}
            clearOnPress={true}
            excludeSelf={true}
          />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
