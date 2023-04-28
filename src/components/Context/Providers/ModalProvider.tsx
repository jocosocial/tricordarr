import React, {useState, PropsWithChildren, ReactNode} from 'react';
import {ModalContext} from '../Contexts/ModalContext';

export const ModalProvider = ({children}: PropsWithChildren) => {
  const [modalContent, setModalContent] = useState<ReactNode>();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <ModalContext.Provider value={{modalContent, setModalContent, modalVisible, setModalVisible}}>
      {children}
    </ModalContext.Provider>
  );
};
