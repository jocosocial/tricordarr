import {Modal} from 'react-native-paper';
import React from 'react';
import {useModal} from '../Context/Contexts/ModalContext';
import {useAppTheme} from '../../Styles/Theme';
import {commonStyles} from '../../Styles';
import {KeyboardAvoidingView} from 'react-native';
import {Dimensions} from 'react-native';

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
