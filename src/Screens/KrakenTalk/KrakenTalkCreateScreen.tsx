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
  const initialCallMadeRef = useRef(false);
  const pushedCallIDRef = useRef<string | null>(null);

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

  // If initialUserHeader is provided, initiate call immediately (once only).
  // handleInitiateCall changes reference when call state changes, so the ref
  // guard prevents the effect from re-initiating on every dependency change.
  useEffect(() => {
    if (route.params?.initialUserHeader && !initialCallMadeRef.current) {
      initialCallMadeRef.current = true;
      handleInitiateCall(route.params.initialUserHeader);
    }
  }, [route.params?.initialUserHeader, handleInitiateCall]);

  // Reset pushed ref when call ends so next call can push
  useEffect(() => {
    if (!currentCall) {
      pushedCallIDRef.current = null;
    }
  }, [currentCall]);

  // Navigate to ActiveCallScreen when call is initiated (once per call to avoid double push)
  useEffect(() => {
    if (
      currentCall &&
      (callState === CallState.INITIATING || callState === CallState.CONNECTING || callState === CallState.ACTIVE)
    ) {
      if (pushedCallIDRef.current === currentCall.callID) {
        return;
      }
      pushedCallIDRef.current = currentCall.callID;
      navigation.push(CommonStackComponents.krakenTalkActiveCallScreen, {
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
            // clearOnPress is false so that the user can come back to this screen and still have
            // the search query. This is useful in error conditions when the call fails pretty
            // quickly
            clearOnPress={false}
            excludeSelf={true}
          />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
