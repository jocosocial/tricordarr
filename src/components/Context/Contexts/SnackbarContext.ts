import {createContext, Dispatch, SetStateAction, useContext} from 'react';
import {SnackbarPayload} from '../../../libraries/Types';

interface SnackbarContextType {
  snackbarPayload?: SnackbarPayload;
  setSnackbarPayload: Dispatch<SetStateAction<SnackbarPayload | undefined>>;
}

export const SnackbarContext = createContext(<SnackbarContextType>{});

export const useSnackbar = () => useContext(SnackbarContext);
