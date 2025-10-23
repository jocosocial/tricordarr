import React, {PropsWithChildren, ReactNode, useState} from 'react';

import {ModalContext} from '#src/Context/Contexts/ModalContext';

export const ModalProvider = ({children}: PropsWithChildren) => {
  const [modalContent, setModalContent] = useState<ReactNode>();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalOnDismiss, setModalOnDismiss] = useState<() => void>();

  return (
    <ModalContext.Provider
      value={{modalContent, setModalContent, modalVisible, setModalVisible, modalOnDismiss, setModalOnDismiss}}
    >
      {children}
    </ModalContext.Provider>
  );
};
