import React from 'react';
import {Dimensions, KeyboardAvoidingView} from 'react-native';
import {Modal} from 'react-native-paper';

import {useModal} from '#src/Context/Contexts/ModalContext';
import {commonStyles} from '#src/Styles';
import {useAppTheme} from '#src/Styles/Theme';

export const AppModal = () => {
  const {modalVisible, modalContent, setModalVisible, modalOnDismiss, setModalOnDismiss} = useModal();
  const theme = useAppTheme();

  const styles = {
    modal: {
      backgroundColor: theme.colors.backdrop,
      // This only exists because the Report modal can be covered by the keyboard. Consider
      // making that a screen instead and not bothering with the modal.
      marginBottom: Dimensions.get('screen').height / 3,
    },
    content: {
      ...commonStyles.marginHorizontal,
    },
  };

  const onDismiss = () => {
    if (modalOnDismiss) {
      modalOnDismiss();
    }
    setModalVisible(false);
    // I hope this doesnt get weird
    setModalOnDismiss(undefined);
  };

  return (
    <Modal contentContainerStyle={styles.content} style={styles.modal} visible={modalVisible} onDismiss={onDismiss}>
      <KeyboardAvoidingView behavior={'height'}>{modalContent}</KeyboardAvoidingView>
    </Modal>
  );
};
