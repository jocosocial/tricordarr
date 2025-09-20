import React from 'react';
import {TextStyle, View} from 'react-native';
import {ModalCard} from '#src/Components/Cards/ModalCard';
import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {useAppTheme} from '#src/Styles/Theme';
import {Text} from 'react-native-paper';
import {useStyles} from '#src/Components/Context/Contexts/StyleContext';
import Clipboard from '@react-native-clipboard/clipboard';

interface UserRecoveryKeyModalViewProps {
  userRecoveryKey: string;
  onPress: () => void;
}

const UserRecoveryKeyModalContent = ({recoveryKey}: {recoveryKey: string}) => {
  const {commonStyles} = useStyles();

  const keyStyle: TextStyle = {
    ...commonStyles.textCenter,
    ...commonStyles.marginVertical,
    ...commonStyles.noteContainer,
    ...commonStyles.onNoteContainer,
    ...commonStyles.roundedBorder,
    ...commonStyles.paddingVerticalSmall,
  };

  return (
    <>
      <Text>
        Your account recovery key can be used if you lose access to your account and can't recover your password. It can
        be used only once and will be shown to you only right now. Write it down (long press to copy to clipboard) or
        screenshot this screen before proceeding.
      </Text>
      <Text style={keyStyle} variant={'titleLarge'} onLongPress={() => Clipboard.setString(recoveryKey)}>
        {recoveryKey}
      </Text>
    </>
  );
};

export const UserRecoveryKeyModalView = ({userRecoveryKey, onPress}: UserRecoveryKeyModalViewProps) => {
  const theme = useAppTheme();

  const cardActions = (
    <PrimaryActionButton
      buttonColor={theme.colors.twitarrPositiveButton}
      buttonText={'Acknowledged'}
      onPress={onPress}
    />
  );
  return (
    <View>
      <ModalCard
        title={'Account Recovery'}
        showCloseButton={false}
        content={<UserRecoveryKeyModalContent recoveryKey={userRecoveryKey} />}
        actions={cardActions}
      />
    </View>
  );
};
