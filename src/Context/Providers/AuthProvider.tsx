import React, {PropsWithChildren, useCallback, useEffect, useMemo} from 'react';

import {AuthContext} from '#src/Context/Contexts/AuthContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {AuthActions, useAuthReducer} from '#src/Reducers/Auth/AuthReducer';
import {TokenStringData} from '#src/Structs/ControllerStructs';

export const AuthProvider = ({children}: PropsWithChildren) => {
  const {currentSession, updateSessionToken, isLoading: sessionLoading} = useSession();
  const [authState, dispatchAuthState] = useAuthReducer({
    isLoading: true,
    tokenData: null,
  });
  const isLoggedIn = !!authState.tokenData;

  const restoreTokenData = useCallback(async () => {
    if (!currentSession) {
      console.log('[AuthProvider.tsx] No current session, signing out.');
      dispatchAuthState({
        type: AuthActions.signOut,
      });
      return;
    }

    const tokenData = currentSession.tokenData;
    if (tokenData) {
      dispatchAuthState({
        type: AuthActions.restore,
        tokenData: tokenData,
      });
    } else {
      console.log('[AuthProvider.tsx] No token data in current session.');
      dispatchAuthState({
        type: AuthActions.signOut,
      });
    }
  }, [dispatchAuthState, currentSession]);

  useEffect(() => {
    if (!sessionLoading) {
      restoreTokenData();
    }
  }, [restoreTokenData, sessionLoading, currentSession?.sessionID, currentSession?.tokenData]);

  // https://reactnavigation.org/docs/auth-flow/
  const authContext = useMemo(
    () => ({
      signIn: async (tokenData: TokenStringData, preRegMode: boolean = false) => {
        if (!currentSession) {
          console.error('[AuthProvider.tsx] Cannot sign in: no current session');
          return;
        }
        await updateSessionToken(currentSession.sessionID, tokenData);
        dispatchAuthState({
          type: AuthActions.signIn,
          tokenData: tokenData,
        });
      },
      signOut: async (preRegMode: boolean = false) => {
        if (!currentSession) {
          console.error('[AuthProvider.tsx] Cannot sign out: no current session');
          return;
        }
        await updateSessionToken(currentSession.sessionID, null);
        dispatchAuthState({
          type: AuthActions.signOut,
        });
      },
      restore: async () => await restoreTokenData(),
    }),
    [dispatchAuthState, restoreTokenData, currentSession, updateSessionToken],
  );

  const isLoading = authState.isLoading || sessionLoading;

  return (
    <AuthContext.Provider
      value={{
        ...authContext,
        tokenData: authState.tokenData,
        isLoggedIn: isLoggedIn,
        isLoading: isLoading,
      }}>
      {children}
    </AuthContext.Provider>
  );
};
