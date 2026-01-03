import React, {useState} from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {ModalCard} from '#src/Components/Cards/ModalCard';
import {useModal} from '#src/Context/Contexts/ModalContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {useSettingsStack} from '#src/Navigation/Stacks/SettingsStackNavigator';

interface SessionDeleteModalViewProps {
  sessionID: string;
}

const ModalContent = () => {
  const {commonStyles} = useStyles();
  return (
    <Text style={[commonStyles.marginBottomSmall]}>
      Are you sure you want to delete this session? This action cannot be undone.
    </Text>
  );
};

export const SessionDeleteModalView = ({sessionID}: SessionDeleteModalViewProps) => {
  const {setModalVisible} = useModal();
  const {theme} = useAppTheme();
  const {deleteSession} = useSession();
  const settingsNavigation = useSettingsStack();
  const [isDeleting, setIsDeleting] = useState(false);

  const onSubmit = async () => {
    setIsDeleting(true);
    try {
      await deleteSession(sessionID);
      setModalVisible(false);
      // Navigate back to session list
      settingsNavigation.goBack();
    } catch (error) {
      console.error('[SessionDeleteModalView] Error deleting session:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const cardActions = (
    <PrimaryActionButton
      buttonColor={theme.colors.twitarrNegativeButton}
      buttonText={'Delete'}
      onPress={onSubmit}
      isLoading={isDeleting}
      disabled={isDeleting}
    />
  );

  return (
    <View>
      <ModalCard title={'Delete Session'} closeButtonText={'Cancel'} content={<ModalContent />} actions={cardActions} />
    </View>
  );
};
