import React, {useCallback, useEffect, useMemo} from 'react';
import {PropsWithChildren} from 'react';
import {AuthContext} from '#src/Context/Contexts/AuthContext.ts';
import {AuthActions, useAuthReducer} from '#src/Reducers/Auth/AuthReducer.ts';
import {TokenStringData} from '../../../Libraries/Structs/ControllerStructs.tsx';
import {useConfig} from '#src/Context/Contexts/ConfigContext.ts';
import {StorageKeys} from '../../../Libraries/Storage/index.ts';

export const AuthProvider = ({children}: PropsWithChildren) => {
  const {preRegistrationMode} = useConfig();
  const [authState, dispatchAuthState] = useAuthReducer({
    isLoading: true,
    tokenData: null,
  });
  const isLoggedIn = !!authState.tokenData;

  const loadStoredTokenData = useCallback(async () => {
    let tokenStringData: string | null;
    if (preRegistrationMode) {
      tokenStringData = await TokenStringData.getLocal(StorageKeys.PREREGISTRATION_TOKEN_STRING_DATA);
      console.log('[AuthProvider.tsx] loaded preRegistration token');
    } else {
      tokenStringData = await TokenStringData.getLocal(StorageKeys.TOKEN_STRING_DATA_V2);
      console.log('[AuthProvider.tsx] loaded regular token');
    }
    if (tokenStringData) {
      return JSON.parse(tokenStringData) as TokenStringData;
    }
  }, [preRegistrationMode]);

  const restoreTokenData = useCallback(async () => {
    const tokenData = await loadStoredTokenData();
    if (tokenData) {
      dispatchAuthState({
        type: AuthActions.restore,
        tokenData: tokenData,
      });
    } else {
      console.log('[AuthProvider.tsx] No token data found in local encrypted storage.');
      dispatchAuthState({
        type: AuthActions.signOut,
      });
    }
  }, [dispatchAuthState, loadStoredTokenData]);

  useEffect(() => {
    restoreTokenData();
  }, [restoreTokenData, preRegistrationMode]);

  // https://reactnavigation.org/docs/auth-flow/
  const authContext = useMemo(
    () => ({
      signIn: async (tokenData: TokenStringData, preRegMode: boolean = false) => {
        const key = preRegMode ? StorageKeys.PREREGISTRATION_TOKEN_STRING_DATA : StorageKeys.TOKEN_STRING_DATA_V2;
        await TokenStringData.setLocal(key, tokenData);
        dispatchAuthState({
          type: AuthActions.signIn,
          tokenData: tokenData,
        });
      },
      signOut: async (preRegMode: boolean = false) => {
        const key = preRegMode ? StorageKeys.PREREGISTRATION_TOKEN_STRING_DATA : StorageKeys.TOKEN_STRING_DATA_V2;
        await TokenStringData.clearLocal(key);
        dispatchAuthState({
          type: AuthActions.signOut,
        });
      },
      restore: async () => await restoreTokenData(),
    }),
    [dispatchAuthState, restoreTokenData],
  );

  return (
    <AuthContext.Provider
      value={{
        ...authContext,
        tokenData: authState.tokenData,
        isLoggedIn: isLoggedIn,
        isLoading: authState.isLoading,
      }}>
      {children}
    </AuthContext.Provider>
  );
};
