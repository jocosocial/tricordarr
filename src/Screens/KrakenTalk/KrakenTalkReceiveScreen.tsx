import {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useRef} from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, Text} from 'react-native-paper';

import {AvatarImage} from '#src/Components/Images/AvatarImage';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {CallState, useCall} from '#src/Context/Contexts/CallContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {SwiftarrFeature} from '#src/Enums/AppFeatures';
import {ChatStackParamList, ChatStackScreenComponents} from '#src/Navigation/Stacks/Chat/ChatStackComponents';
import {CommonStackComponents} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {DisabledFeatureScreen} from '#src/Screens/Checkpoint/DisabledFeatureScreen';
import {LoggedInScreen} from '#src/Screens/Checkpoint/LoggedInScreen';
import {PreRegistrationScreen} from '#src/Screens/Checkpoint/PreRegistrationScreen';

type Props = StackScreenProps<ChatStackParamList, ChatStackScreenComponents.krakenTalkReceiveScreen>;

export const KrakenTalkReceiveScreen = (props: Props) => {
  return (
    <LoggedInScreen>
      <PreRegistrationScreen helpScreen={CommonStackComponents.krakenTalkHelpScreen}>
        <DisabledFeatureScreen feature={SwiftarrFeature.phone}>
          <KrakenTalkReceiveScreenInner {...props} />
        </DisabledFeatureScreen>
      </PreRegistrationScreen>
    </LoggedInScreen>
  );
};

const KrakenTalkReceiveScreenInner = ({route, navigation}: Props) => {
  const {answerCall, declineCall, receiveCall, callState} = useCall();
  const {theme} = useAppTheme();
  const answeredHereRef = useRef(false);

  useEffect(() => {
    receiveCall(
      route.params.callID,
      {
        userID: route.params.callerUserID,
        username: route.params.callerUsername,
      },
      {useCallKit: false},
    );
  }, [route.params.callID, route.params.callerUserID, route.params.callerUsername, receiveCall]);

  // Leave this screen when the call stops ringing for any reason other than this device answering:
  // the caller gave up, someone declined, or it was answered on another of the user's devices.
  // Without this the incoming-call screen stayed up indefinitely, because nothing else here was
  // watching the call state -- onAnswer and onDecline were the only ways off the screen.
  //
  // Gated on having actually reached RINGING first. The screen mounts before its receiveCall()
  // effect has dispatched, so the state at mount is still IDLE on a first call, or ENDED left over
  // from a previous one (the reducer never returns to IDLE). Popping on those would close the
  // screen the instant it opened.
  const hasRungRef = useRef(false);
  useEffect(() => {
    if (callState === CallState.RINGING || callState === CallState.CONNECTING) {
      hasRungRef.current = true;
      return;
    }
    if (!hasRungRef.current || answeredHereRef.current) {
      return;
    }
    if (callState === CallState.ENDED || callState === CallState.IDLE) {
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    }
  }, [callState, navigation]);

  const onAnswer = useCallback(async () => {
    if (answeredHereRef.current) {
      return;
    }
    answeredHereRef.current = true;
    await answerCall(route.params.callID);
    // This is a replace instead of a push because we want to remove this screen
    // from the stack and never go back.
    navigation.replace(CommonStackComponents.krakenTalkActiveCallScreen, {
      callID: route.params.callID,
    });
  }, [answerCall, route.params.callID, navigation]);

  // The Answer button on the Android call notification deep-links here with autoAnswer set, so
  // that one tap answers the call instead of opening the app to a second Answer button. Waits for
  // RINGING so that receiveCall() has populated the call state that answerCall() needs.
  const autoAnswer = route.params.autoAnswer === true || route.params.autoAnswer === 'true';
  useEffect(() => {
    if (!autoAnswer || callState !== CallState.RINGING || answeredHereRef.current) {
      return;
    }
    onAnswer();
  }, [autoAnswer, callState, onAnswer]);

  const onDecline = useCallback(async () => {
    await declineCall(route.params.callID);
    navigation.goBack();
  }, [declineCall, route.params.callID, navigation]);

  return (
    <AppView>
      <ScrollingContentView isStack={false}>
        <PaddedContentView padSides={false}>
          <View style={styles.container}>
            <View style={styles.avatarContainer}>
              <AvatarImage
                userHeader={{
                  userID: route.params.callerUserID,
                  username: route.params.callerUsername,
                }}
              />
            </View>

            <Text variant={'headlineMedium'} style={styles.username}>
              {route.params.callerUsername}
            </Text>

            <Text variant={'titleMedium'} style={styles.callStatus}>
              Incoming Call...
            </Text>

            <View style={styles.buttonContainer}>
              <Button
                mode={'contained'}
                onPress={onDecline}
                buttonColor={theme.colors.error}
                icon={'phone-hangup'}
                style={styles.button}
                contentStyle={styles.buttonContent}>
                Decline
              </Button>

              <Button
                mode={'contained'}
                onPress={onAnswer}
                buttonColor={theme.colors.twitarrPositiveButton}
                icon={'phone'}
                style={styles.button}
                contentStyle={styles.buttonContent}>
                Answer
              </Button>
            </View>
          </View>
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  avatarContainer: {
    marginBottom: 24,
  },
  username: {
    marginBottom: 8,
    textAlign: 'center',
  },
  callStatus: {
    marginBottom: 48,
    textAlign: 'center',
    opacity: 0.7,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 32,
  },
  button: {
    flex: 1,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});
