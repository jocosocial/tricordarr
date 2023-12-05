import {createContext, Dispatch, ReactNode, SetStateAction, useContext} from 'react';

export interface ModalContextType {
  modalContent?: ReactNode;
  setModalContent: Dispatch<SetStateAction<ReactNode>>;
  modalVisible: boolean;
  setModalVisible: Dispatch<SetStateAction<boolean>>;
  modalOnDismiss?: () => void;
  setModalOnDismiss: Dispatch<SetStateAction<undefined | (() => void)>>;
}

export const ModalContext = createContext({} as ModalContextType);

export const useModal = () => useContext(ModalContext);
