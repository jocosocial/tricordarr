import {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useMemo, useRef} from 'react';

import {UserMatchSearchBar} from '#src/Components/Search/UserSearchBar/UserMatchSearchBar';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {CallState, useCall} from '#src/Context/Contexts/CallContext';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/CommonScreens';
import {UserHeader} from '#src/Structs/ControllerStructs';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.krakenTalkCreateScreen>;

export const KrakenTalkCreateScreen = ({route, navigation}: Props) => {
  const {initiateCall, currentCall, callState} = useCall();
  const initiatingRef = useRef(false);

  const excludeHeaders = useMemo((): UserHeader[] => {
    const headers: UserHeader[] = [];
    if (route.params?.initialUserHeader) {
      headers.push(route.params.initialUserHeader);
    }
    if (currentCall?.remoteUser) {
      const alreadyIncluded = headers.some(h => h.userID === currentCall.remoteUser.userID);
      if (!alreadyIncluded) {
        headers.push(currentCall.remoteUser);
      }
    }
    return headers;
  }, [route.params?.initialUserHeader, currentCall?.remoteUser]);

  const handleInitiateCall = useCallback(
    async (userHeader: UserHeader) => {
      if (initiatingRef.current) {
        return;
      }
      initiatingRef.current = true;
      try {
        await initiateCall(userHeader);
      } catch (error) {
        console.error('[KrakenTalkCreateScreen] Failed to initiate call:', error);
      } finally {
        initiatingRef.current = false;
      }
    },
    [initiateCall],
  );

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
      navigation.replace(CommonStackComponents.krakenTalkActiveCallScreen, {
        callID: currentCall.callID,
      });
    }
  }, [currentCall, callState, navigation]);

  return (
    <AppView>
      <ScrollingContentView>
        <PaddedContentView>
          <UserMatchSearchBar
            excludeHeaders={excludeHeaders}
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
