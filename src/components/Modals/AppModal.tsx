import {Modal} from 'react-native-paper';
import React from 'react';
import {useModal} from '../Context/Contexts/ModalContext';
import {useStyles} from '../Context/Contexts/StyleContext';

export const AppModal = () => {
  const {modalVisible, modalContent, setModalVisible} = useModal();
  const {commonStyles} = useStyles();

  const styles = {
    modal: {
      // padding: 20,
      // opacity: 0.1,
      // ...commonStyles.container,
      // backgroundColor: theme.colors.secondaryContainer,
      // ...commonStyles.secondaryContainer,
      // ...commonStyles.roundedBorderLarge,
      ...commonStyles.marginTop,
      ...commonStyles.marginBottom,
      ...commonStyles.marginHorizontal,
      // flex: 0,
      // height: 20,
      // margin: 20,
      // marginVertical: 40,
      // marginTop: 20,
      // marginBottom: 20,
    },
    content: {
      // ...commonStyles.secondaryContainer,
      // ...commonStyles.roundedBorderLarge,
      // opacity: 1,
      // backgroundColor: 'pink',
      // flex: 1,
    },
  };

  return (
    <Modal
      contentContainerStyle={styles.content}
      style={styles.modal}
      visible={modalVisible}
      onDismiss={() => setModalVisible(false)}>
      {modalContent}
    </Modal>
  );
};
