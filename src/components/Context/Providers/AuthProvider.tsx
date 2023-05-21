import React, {useEffect, useMemo} from 'react';
import {PropsWithChildren} from 'react';
import {AuthContext} from '../Contexts/AuthContext';
import {AuthActions, useAuthReducer} from '../../Reducers/Auth/AuthReducer';
import {TokenStringData} from '../../../libraries/Structs/ControllerStructs';
import {AppSettings} from '../../../libraries/AppSettings';
import {useQueryClient} from '@tanstack/react-query';

export const AuthProvider = ({children}: PropsWithChildren) => {
  const [authState, dispatchAuthState] = useAuthReducer({
    isLoading: true,
    tokenData: null,
  });
  const queryClient = useQueryClient();
  const isLoggedIn = !!authState.tokenData;

  useEffect(() => {
    const restoreTokenData = async () => {
      const tokenStringData = await AppSettings.TOKEN_STRING_DATA.getValue();
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

  useEffect(() => {
    if (authState.tokenData) {
      const currentOptions = queryClient.getDefaultOptions();
      queryClient.setDefaultOptions({
        ...currentOptions,
        queries: {
          enabled: true,
        },
      });
      console.info('API queries have been enabled');
    }
  }, [authState, queryClient]);

  // https://reactnavigation.org/docs/auth-flow/
  const authContext = useMemo(
    () => ({
      signIn: async (tokenData: TokenStringData) => {
        await AppSettings.TOKEN_STRING_DATA.setValue(JSON.stringify(tokenData));
        dispatchAuthState({
          type: AuthActions.signIn,
          tokenData: tokenData,
        });
      },
      signOut: async () => {
        await AppSettings.TOKEN_STRING_DATA.remove();
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
    <AuthContext.Provider value={{...authContext, tokenData: authState.tokenData, isLoggedIn: isLoggedIn}}>
      {children}
    </AuthContext.Provider>
  );
};
