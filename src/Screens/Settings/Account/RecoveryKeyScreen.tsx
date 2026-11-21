import {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {LayoutChangeEvent, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import {captureRef} from 'react-native-view-shot';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';
import {useClipboard} from '#src/Hooks/useClipboard';
import {useOnboardingCommit} from '#src/Hooks/useOnboardingCommit';
import {createLogger} from '#src/Libraries/Logger';
import {saveImageToCameraRoll} from '#src/Libraries/Storage/ImageStorage';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';

const logger = createLogger('RecoveryKeyScreen.tsx');

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.recoveryKeyScreen>;

/**
 * Shows a new account's recovery key, once, and holds the user here until they acknowledge it. For
 * a fresh registration the account is not signed in yet; acknowledging does that.
 */
export const RecoveryKeyScreen = ({navigation, route}: Props) => {
  const {commonStyles} = useStyles();
  const {theme} = useAppTheme();
  const {setString} = useClipboard();
  const {setSnackbarPayload} = useSnackbar();
  const canLeaveRef = useRef(false);
  const screenshotRef = useRef<View>(null);
  const [capturing, setCapturing] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  // Height of the Acknowledged button area, so snackbars draw above it rather than over it.
  const [footerHeight, setFooterHeight] = useState(0);
  const recoveryKey = route.params.recoveryKey;
  const username = route.params.username;
  const pendingSignIn = route.params.pendingSignIn;
  const {serverUrl: sessionServerUrl} = useSwiftarrQueryClient();
  const serverUrl = route.params.serverUrl ?? sessionServerUrl;
  const {commitSignIn} = useOnboardingCommit(pendingSignIn?.mode);
  // The sign-in remounts the session scope, taking this screen with it.
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    navigation.setOptions({
      gestureEnabled: false,
      headerLeft: () => null,
    });
  }, [navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', e => {
      if (!canLeaveRef.current) {
        e.preventDefault();
        setSnackbarPayload({
          message: 'Please acknowledge that you have saved your recovery key.',
          messageType: 'info',
        });
      }
    });
    return unsubscribe;
  }, [navigation, setSnackbarPayload]);

  const onAcknowledge = async () => {
    if (pendingSignIn) {
      setSigningIn(true);
      try {
        await commitSignIn(serverUrl, pendingSignIn.token, pendingSignIn.siteCookie);
      } catch (error) {
        logger.error('Failed to sign in after registration', error);
      }
      if (!mounted.current) {
        return;
      }
      setSigningIn(false);
    }
    canLeaveRef.current = true;
    navigation.goBack();
  };

  const onFooterLayout = (event: LayoutChangeEvent) => setFooterHeight(event.nativeEvent.layout.height);

  const onScreenshot = async () => {
    try {
      setCapturing(true);
      const localUri = await captureRef(screenshotRef, {
        quality: 1,
      });
      await saveImageToCameraRoll(localUri);
      setSnackbarPayload({
        message: 'Screenshot saved to your photo library.',
        messageType: 'success',
      });
    } catch (error) {
      logger.error('Failed to save recovery key screenshot', error);
      const message = error instanceof Error ? error.message : String(error);
      setSnackbarPayload({
        message: `Could not save screenshot: ${message}`,
        messageType: 'error',
      });
    } finally {
      setCapturing(false);
    }
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        fieldLabel: {
          ...commonStyles.bold,
          ...commonStyles.marginTopSmall,
        },
        fieldValue: {
          ...commonStyles.marginBottomSmall,
        },
        key: {
          ...commonStyles.textCenter,
          ...commonStyles.marginVertical,
          ...commonStyles.noteContainer,
          ...commonStyles.onNoteContainer,
          ...commonStyles.roundedBorder,
          ...commonStyles.paddingVerticalSmall,
        },
        capture: {
          backgroundColor: theme.colors.background,
        },
        bottomContainer: {
          ...commonStyles.displayFlex,
          ...commonStyles.flexRow,
          ...commonStyles.marginTopSmall,
        },
      }),
    [commonStyles, theme.colors.background],
  );

  return (
    <AppView disablePreRegistrationWarning={!!pendingSignIn?.mode} snackbarBottomOffset={footerHeight}>
      <ScrollingContentView isStack={true}>
        <View ref={screenshotRef} collapsable={false} style={styles.capture}>
          <PaddedContentView padTop={true}>
            <Text>
              Your account recovery key can be used if you lose access to your account and can't recover your password.
              It will only be shown to you right now.
            </Text>
          </PaddedContentView>
          <PaddedContentView>
            <Text>
              <Text style={styles.fieldLabel}>Username: </Text>
              <Text selectable={false}>{username}</Text>
            </Text>
            <Text>
              <Text style={styles.fieldLabel}>Server: </Text>
              <Text selectable={false}>{serverUrl}</Text>
            </Text>
            <Text style={styles.fieldLabel}>Recovery Key: </Text>
            <Text selectable={false} style={styles.key} variant={'titleLarge'}>
              {recoveryKey}
            </Text>
          </PaddedContentView>
        </View>
        <PaddedContentView>
          <Text>Please save this code using one of the methods below or an analog writing implement.</Text>
        </PaddedContentView>
        <PaddedContentView>
          <PrimaryActionButton
            testID={'copytoClipboard-button'}
            buttonColor={theme.colors.twitarrNeutralButton}
            buttonText={'Copy to Clipboard'}
            icon={AppIcons.copy}
            onPress={() => setString(recoveryKey)}
          />
        </PaddedContentView>
        <PaddedContentView>
          <PrimaryActionButton
            testID={'screenshottoCameraRoll-button'}
            buttonColor={theme.colors.twitarrNeutralButton}
            buttonText={'Screenshot to Camera Roll'}
            icon={AppIcons.screenshot}
            isLoading={capturing}
            onPress={onScreenshot}
          />
        </PaddedContentView>
        <PaddedContentView>
          <Text>Press the button below to acknowledge that you have saved your recovery key.</Text>
        </PaddedContentView>
      </ScrollingContentView>
      <View style={styles.bottomContainer} onLayout={onFooterLayout}>
        <PaddedContentView>
          <PrimaryActionButton
            testID={'acknowledged-button'}
            buttonColor={theme.colors.twitarrPositiveButton}
            buttonText={'Acknowledged'}
            disabled={capturing || signingIn}
            isLoading={signingIn}
            onPress={onAcknowledge}
          />
        </PaddedContentView>
      </View>
    </AppView>
  );
};
