import {createContext, ReactNode, useContext} from 'react';

export interface ModalContextType {
  modalContent?: ReactNode;
  setModalContent: Function;
  modalVisible: boolean;
  setModalVisible: Function;
}

export const ModalContext = createContext({} as ModalContextType);

export const useModal = () => useContext(ModalContext);
