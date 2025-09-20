import React, {useState, PropsWithChildren, ReactNode} from 'react';
import {ModalContext} from '../Contexts/ModalContext';

export const ModalProvider = ({children}: PropsWithChildren) => {
  const [modalContent, setModalContent] = useState<ReactNode>();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalOnDismiss, setModalOnDismiss] = useState<() => void>();

  return (
    <ModalContext.Provider
      value={{modalContent, setModalContent, modalVisible, setModalVisible, modalOnDismiss, setModalOnDismiss}}>
      {children}
    </ModalContext.Provider>
  );
};
