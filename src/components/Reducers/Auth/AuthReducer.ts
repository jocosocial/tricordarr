import {TokenStringData} from '../../../libraries/Structs/ControllerStructs';
import {useReducer} from 'react';

export enum AuthActions {
  signIn = 'SIGN_IN',
  signUp = 'SIGN_UP',
  signOut = 'SIGN_OUT',
  restore = 'RESTORE',
}

export type AuthActionsType =
  | {type: AuthActions.signIn; tokenData: TokenStringData}
  | {type: AuthActions.signUp; tokenData: TokenStringData}
  | {type: AuthActions.restore; tokenData: TokenStringData}
  | {type: AuthActions.signOut};

export interface AuthState {
  isLoading: boolean;
  isSignout: boolean;
  tokenData: TokenStringData | null;
}
export const authActionReducer = (prevState: AuthState, action: AuthActionsType): AuthState => {
  switch (action.type) {
    case AuthActions.signIn || AuthActions.signUp: {
      return {
        ...prevState,
        tokenData: action.tokenData,
      };
    }
    case AuthActions.signOut: {
      return {
        ...prevState,
        isSignout: true,
        tokenData: null,
      };
    }
    case AuthActions.restore: {
      return {
        ...prevState,
        isLoading: false,
        tokenData: action.tokenData,
      };
    }
    default: {
      throw new Error('Unknown AuthAction');
    }
  }
};

export const useAuthReducer = (initialState: AuthState) => useReducer(authActionReducer, initialState);
