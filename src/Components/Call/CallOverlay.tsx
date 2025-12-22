import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import ErrorBoundary from 'react-native-error-boundary';
import { IconButton, Text } from 'react-native-paper';

import { UserAvatarImage } from '#src/Components/Images/UserAvatarImage';
import { CallState, useCall } from '#src/Context/Contexts/CallContext';
import { useAppTheme } from '#src/Context/Contexts/ThemeContext';
import { ChatStackParamList, ChatStackScreenComponents } from '#src/Navigation/Stacks/ChatStackNavigator';

type NavigationProp = StackNavigationProp<ChatStackParamList>;

const formatCallDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Inner component that uses navigation hooks.
 * This will only render if navigation is available.
 * If navigation hooks throw errors (e.g., outside NavigationContainer),
 * the ErrorBoundary will catch them and render the fallback.
 */
const CallOverlayInner = () => {
  const { currentCall, callState, callDuration, endCall } = useCall();
  const { theme } = useAppTheme();

  // useNavigation will throw if not inside NavigationContainer - ErrorBoundary will catch it
  const navigation = useNavigation<NavigationProp>();

  // Track if we're on the ActiveCallScreen using navigation state listener
  // This avoids using useNavigationState which throws outside a navigator
  const [isOnActiveCallScreen, setIsOnActiveCallScreen] = React.useState(false);

  React.useEffect(() => {
    // Try to get current route name from navigation state
    const updateRoute = () => {
      try {
        const state = navigation.getState();
        if (state) {
          const findActiveRoute = (navState: any): any => {
            if (!navState) return null;
            if (navState.index !== undefined && navState.routes) {
              const route = navState.routes[navState.index];
              if (route.state) {
                return findActiveRoute(route.state);
              }
              return route;
            }
            return navState;
          };
          const activeRoute = findActiveRoute(state);
          setIsOnActiveCallScreen(activeRoute?.name === ChatStackScreenComponents.activeCallScreen);
        }
      } catch (error) {
        // Navigation state not available - assume we're not on ActiveCallScreen
        setIsOnActiveCallScreen(false);
      }
    };

    // Update on mount
    updateRoute();

    // Listen for navigation state changes
    const unsubscribe = navigation.addListener('state', updateRoute);

    return unsubscribe;
  }, [navigation]);

  // Only show overlay when call is active and not on ActiveCallScreen
  if (callState !== CallState.ACTIVE || !currentCall || isOnActiveCallScreen) {
    return null;
  }

  const handlePress = () => {
    // Navigate to ActiveCallScreen
    navigation.navigate(ChatStackScreenComponents.activeCallScreen, {
      callID: currentCall.callID,
    });
  };

  const handleEndCall = async () => {
    await endCall();
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.8}>
      <View style={[styles.content, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.avatarContainer}>
          <UserAvatarImage userHeader={currentCall.remoteUser} small={true} />
        </View>

        <View style={styles.infoContainer}>
          <Text variant={'bodyMedium'} style={styles.username} numberOfLines={1}>
            {currentCall.remoteUser.username}
          </Text>
          <Text variant={'bodySmall'} style={[styles.duration, { color: theme.colors.onSurfaceVariant }]}>
            {formatCallDuration(callDuration)}
          </Text>
        </View>

        <IconButton
          icon={'phone-hangup'}
          size={24}
          iconColor={theme.colors.onError}
          containerColor={theme.colors.error}
          onPress={handleEndCall}
          style={styles.endButton}
        />
      </View>
    </TouchableOpacity>
  );
};

/**
 * Fallback component when navigation is not available
 */
const CallOverlayFallback = () => {
  // Just return null - overlay won't show if navigation isn't available
  return null;
};

/**
 * Floating overlay component that appears when user navigates away from ActiveCallScreen
 * during an active call. Allows user to quickly return to the call screen.
 *
 * Wrapped in error boundary to handle cases where navigation context is not available.
 */
export const CallOverlay = () => {
  const { currentCall, callState } = useCall();

  // Only try to render if there's an active call
  if (callState !== CallState.ACTIVE || !currentCall) {
    return null;
  }

  // Wrap in ErrorBoundary to catch navigation context errors
  // If navigation hooks fail (outside navigation context or not in a navigator), fallback renders nothing
  return (
    <ErrorBoundary
      FallbackComponent={CallOverlayFallback}
      onError={(error, errorInfo) => {
        // Log the error for debugging, but don't crash the app
        console.warn(
          '[CallOverlay] Navigation context error (this is expected if rendered outside a navigator):',
          error.message,
        );
      }}>
      <CallOverlayInner />
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  avatarContainer: {
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  username: {
    fontWeight: '500',
  },
  duration: {
    marginTop: 2,
  },
  endButton: {
    margin: 0,
  },
});
