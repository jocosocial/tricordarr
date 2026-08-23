import {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useRef} from 'react';
import {TextStyle, View} from 'react-native';
import {Text} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {MaterialHeaderButtons} from '#src/Components/Buttons/MaterialHeaderButtons';
import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {AppView} from '#src/Components/Views/AppView';
import {PaddedContentView} from '#src/Components/Views/Content/PaddedContentView';
import {ScrollingContentView} from '#src/Components/Views/Content/ScrollingContentView';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';
import {useClipboard} from '#src/Hooks/useClipboard';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';

type Props = StackScreenProps<CommonStackParamList, CommonStackComponents.recoveryKeyScreen>;

export const RecoveryKeyScreen = ({navigation, route}: Props) => {
  const {commonStyles} = useStyles();
  const {theme} = useAppTheme();
  const {setString} = useClipboard();
  const {setSnackbarPayload} = useSnackbar();
  const canLeaveRef = useRef(false);
  const recoveryKey = route.params.recoveryKey;

  const getNavButtons = useCallback(() => {
    return (
      <View>
        <MaterialHeaderButtons>
          <Item
            title={'Help'}
            iconName={AppIcons.help}
            onPress={() => navigation.push(CommonStackComponents.recoveryKeyHelpScreen)}
          />
        </MaterialHeaderButtons>
      </View>
    );
  }, [navigation]);

  useEffect(() => {
    navigation.setOptions({
      gestureEnabled: false,
      headerLeft: () => null,
      headerRight: getNavButtons,
    });
  }, [getNavButtons, navigation]);

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

  const keyStyle: TextStyle = {
    ...commonStyles.textCenter,
    ...commonStyles.marginVertical,
    ...commonStyles.noteContainer,
    ...commonStyles.onNoteContainer,
    ...commonStyles.roundedBorder,
    ...commonStyles.paddingVerticalSmall,
  };

  return (
    <AppView>
      <ScrollingContentView isStack={true}>
        <PaddedContentView padTop={true}>
          <Text>
            Your account recovery key can be used if you lose access to your account and can't recover your password. It
            can be used only once and will be shown to you only right now. Write it down (press to copy to clipboard,
            long press to select) or screenshot this screen before proceeding.
          </Text>
        </PaddedContentView>
        <PaddedContentView>
          <Text selectable={true} style={keyStyle} variant={'titleLarge'} onPress={() => setString(recoveryKey)}>
            {recoveryKey}
          </Text>
        </PaddedContentView>
        <PaddedContentView>
          <PrimaryActionButton
            buttonColor={theme.colors.twitarrPositiveButton}
            buttonText={'Acknowledged'}
            onPress={onAcknowledge}
          />
        </PaddedContentView>
      </ScrollingContentView>
    </AppView>
  );
};
