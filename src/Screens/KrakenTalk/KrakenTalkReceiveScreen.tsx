import {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, Text} from 'react-native-paper';

import {UserAvatarImage} from '#src/Components/Images/UserAvatarImage';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useCall} from '#src/Context/Contexts/CallContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {ChatStackParamList, ChatStackScreenComponents} from '#src/Navigation/Stacks/ChatStackNavigator';

type Props = StackScreenProps<ChatStackParamList, ChatStackScreenComponents.krakenTalkReceiveScreen>;
export const KrakenTalkReceiveScreen = ({route, navigation}: Props) => {
  const {answerCall, declineCall, receiveCall} = useCall();
  const {theme} = useAppTheme();

  useEffect(() => {
    receiveCall(route.params.callID, {
      userID: route.params.callerUserID,
      username: route.params.callerUsername,
    });
  }, [route.params.callID, route.params.callerUserID, route.params.callerUsername, receiveCall]);

  const onAnswer = useCallback(async () => {
    await answerCall(route.params.callID);
    navigation.replace(ChatStackScreenComponents.activeCallScreen, {
      callID: route.params.callID,
    });
  }, [answerCall, route.params.callID, navigation]);

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
              <UserAvatarImage
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
