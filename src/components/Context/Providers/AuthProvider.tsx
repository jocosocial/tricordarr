import React, {useEffect, useMemo} from 'react';
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

  useEffect(() => {
    const restoreTokenData = async () => {
      const tokenStringData = await TokenStringData.getLocal();
      if (tokenStringData) {
        return JSON.parse(tokenStringData) as TokenStringData;
      }
    };
    restoreTokenData().then(tokenData => {
      if (tokenData) {
        dispatchAuthState({
          type: AuthActions.restore,
          tokenData: tokenData,
        });
      } else {
        console.log('No token data found in local encrypted storage');
      }
    });
  }, [dispatchAuthState]);

  // https://reactnavigation.org/docs/auth-flow/
  const authContext = useMemo(
    () => ({
      signIn: async (tokenData: TokenStringData) => {
        await TokenStringData.setLocal(tokenData);
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
      signUp: () => console.log('sign up'),
    }),
    [dispatchAuthState],
  );

  console.log('Auth State', authState);

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
