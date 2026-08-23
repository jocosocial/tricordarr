import {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {StyleSheet, View} from 'react-native';
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
import {createLogger} from '#src/Libraries/Logger';
import {saveImageToCameraRoll} from '#src/Libraries/Storage/ImageStorage';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';

const logger = createLogger('RecoveryKeyScreen.tsx');

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.recoveryKeyScreen>;

export const RecoveryKeyScreen = ({navigation, route}: Props) => {
  const {commonStyles} = useStyles();
  const {theme} = useAppTheme();
  const {setString} = useClipboard();
  const {setSnackbarPayload} = useSnackbar();
  const canLeaveRef = useRef(false);
  const screenshotRef = useRef<View>(null);
  const [capturing, setCapturing] = useState(false);
  const recoveryKey = route.params.recoveryKey;
  const username = route.params.username;
  const {serverUrl} = useSwiftarrQueryClient();

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

  const onAcknowledge = () => {
    canLeaveRef.current = true;
    navigation.goBack();
  };

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
    <AppView>
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
            buttonColor={theme.colors.twitarrNeutralButton}
            buttonText={'Copy to Clipboard'}
            icon={AppIcons.copy}
            onPress={() => setString(recoveryKey)}
          />
        </PaddedContentView>
        <PaddedContentView>
          <PrimaryActionButton
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
      <View style={styles.bottomContainer}>
        <PaddedContentView>
          <PrimaryActionButton
            buttonColor={theme.colors.twitarrPositiveButton}
            buttonText={'Acknowledged'}
            disabled={capturing}
            onPress={onAcknowledge}
          />
        </PaddedContentView>
      </View>
    </AppView>
  );
};
