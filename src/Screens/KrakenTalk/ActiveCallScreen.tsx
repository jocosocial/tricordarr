import {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import {IconButton, Text} from 'react-native-paper';

import {AvatarImage} from '#src/Components/Images/AvatarImage';
import {AppView} from '#src/Components/Views/AppView';
import {CallState, useCall} from '#src/Context/Contexts/CallContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {ChatStackParamList, ChatStackScreenComponents} from '#src/Navigation/Stacks/ChatStackNavigator';

type Props = StackScreenProps<ChatStackParamList, ChatStackScreenComponents.activeCallScreen>;

const formatCallDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

export const ActiveCallScreen = ({route, navigation}: Props) => {
  const {currentCall, callState, callDuration, isMuted, isSpeakerOn, toggleMute, toggleSpeaker, endCall} = useCall();
  const {theme} = useAppTheme();
  const callStartTimeRef = React.useRef<number | null>(null);

  // Track when call screen was mounted to prevent immediate exit
  React.useEffect(() => {
    if (currentCall && callState !== CallState.ENDED) {
      callStartTimeRef.current = Date.now();
    }
  }, [currentCall, callState]);

  useEffect(() => {
    if (callState === CallState.ENDED || !currentCall) {
      // Only navigate away if call has been active for at least 500ms
      // This prevents immediate exit if socket closes right after opening
      const timeSinceStart = callStartTimeRef.current ? Date.now() - callStartTimeRef.current : Infinity;
      if (timeSinceStart > 500) {
        console.log('[ActiveCallScreen] Call ended, navigating back', {timeSinceStart, callState});
        navigation.goBack();
      } else {
        console.log('[ActiveCallScreen] Call ended too quickly, may be an error', {timeSinceStart, callState});
      }
    }
  }, [callState, currentCall, navigation]);

  const handleEndCall = async () => {
    await endCall();
  };

  if (!currentCall) {
    return null;
  }

  const isConnecting = callState === CallState.INITIATING || callState === CallState.CONNECTING;

  return (
    <AppView>
      <View style={styles.container}>
        <View style={styles.userSection}>
          <View style={styles.avatarContainer}>
            <AvatarImage userHeader={currentCall.remoteUser} />
          </View>

          <Text variant={'headlineMedium'} style={styles.username}>
            {currentCall.remoteUser.username}
          </Text>

          <Text variant={'titleMedium'} style={styles.duration}>
            {isConnecting ? 'Connecting...' : formatCallDuration(callDuration)}
          </Text>
        </View>

        <View style={styles.controlsSection}>
          <View style={styles.controlRow}>
            <View style={styles.controlItem}>
              <IconButton
                icon={isMuted ? 'microphone-off' : 'microphone'}
                size={48}
                mode={'contained'}
                selected={isMuted}
                containerColor={isMuted ? theme.colors.errorContainer : theme.colors.surfaceVariant}
                onPress={toggleMute}
              />
              <Text variant={'labelSmall'} style={styles.controlLabel}>
                {isMuted ? 'Muted' : 'Mute'}
              </Text>
            </View>

            <View style={styles.controlItem}>
              <IconButton
                icon={isSpeakerOn ? 'volume-high' : 'volume-medium'}
                size={48}
                mode={'contained'}
                selected={isSpeakerOn}
                containerColor={isSpeakerOn ? theme.colors.primaryContainer : theme.colors.surfaceVariant}
                onPress={toggleSpeaker}
              />
              <Text variant={'labelSmall'} style={styles.controlLabel}>
                Speaker
              </Text>
            </View>
          </View>

          <View style={styles.endCallContainer}>
            <IconButton
              icon={'phone-hangup'}
              size={64}
              mode={'contained'}
              containerColor={theme.colors.error}
              iconColor={theme.colors.onError}
              onPress={handleEndCall}
            />
          </View>
        </View>
      </View>
    </AppView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 32,
  },
  userSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarContainer: {
    marginBottom: 24,
  },
  username: {
    marginBottom: 8,
    textAlign: 'center',
  },
  duration: {
    textAlign: 'center',
    opacity: 0.7,
  },
  controlsSection: {
    alignItems: 'center',
    gap: 32,
  },
  controlRow: {
    flexDirection: 'row',
    gap: 48,
  },
  controlItem: {
    alignItems: 'center',
    gap: 8,
  },
  controlLabel: {
    opacity: 0.7,
  },
  endCallContainer: {
    alignItems: 'center',
  },
});
