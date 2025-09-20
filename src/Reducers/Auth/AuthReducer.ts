import {useReducer} from 'react';

import {TokenStringData} from '#src/Structs/ControllerStructs';

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
  tokenData: TokenStringData | null;
}
export const authActionReducer = (prevState: AuthState, action: AuthActionsType): AuthState => {
  console.log('[AuthReducer.ts] Got action:', action.type);
  switch (action.type) {
    case AuthActions.signIn || AuthActions.signUp: {
      return {
        ...prevState,
        tokenData: action.tokenData,
        isLoading: false,
      };
    }
    case AuthActions.signOut: {
      return {
        ...prevState,
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
