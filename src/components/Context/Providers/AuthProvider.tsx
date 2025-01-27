import React, {useCallback, useEffect, useMemo} from 'react';
import {PropsWithChildren} from 'react';
import {AuthContext} from '../Contexts/AuthContext';
import {AuthActions, useAuthReducer} from '../../Reducers/Auth/AuthReducer';
import {TokenStringData} from '../../../libraries/Structs/ControllerStructs';

export const AuthProvider = ({children}: PropsWithChildren) => {
  const [authState, dispatchAuthState] = useAuthReducer({
    isLoading: true,
    tokenData: null,
  });
  const isLoggedIn = !!authState.tokenData;

  const loadStoredTokenData = useCallback(async () => {
    const tokenStringData = await TokenStringData.getLocal();
    if (tokenStringData) {
      return JSON.parse(tokenStringData) as TokenStringData;
    }
  }, []);

  const restoreTokenData = useCallback(async () => {
    const tokenData = await loadStoredTokenData();
    if (tokenData) {
      dispatchAuthState({
        type: AuthActions.restore,
        tokenData: tokenData,
      });
    } else {
      console.log('[AuthProvider.tsx] No token data found in local encrypted storage.');
    }
  }, [dispatchAuthState, loadStoredTokenData]);

  useEffect(() => {
    restoreTokenData();
  }, [restoreTokenData]);

  // https://reactnavigation.org/docs/auth-flow/
  const authContext = useMemo(
    () => ({
      signIn: async (tokenData: TokenStringData, noPersist: boolean = false) => {
        if (!noPersist) {
          await TokenStringData.setLocal(tokenData);
        } else {
          console.log('[AuthProvider.tsx] Not persisting TokenStringData.');
        }
        dispatchAuthState({
          type: AuthActions.signIn,
          tokenData: tokenData,
        });
      },
      signOut: async () => {
        await TokenStringData.clearLocal();
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
